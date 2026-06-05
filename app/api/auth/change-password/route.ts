import { NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth'
import { hashPassword, verifyPassword } from '@/lib/manual-auth'
import { findCredentialByProfileId, updatePasswordHash } from '@/lib/db-endpoints/auth'

type ChangePasswordBody = {
  current_password?: string
  new_password?: string
}

//change pass flow for signed-in user
export async function POST(req: Request) {
  //need a real signed-in user first
  const auth = await getRequestUser(req)
  if (auth.user === null) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  //read body + basic guardrails
  const body = (await req.json()) as ChangePasswordBody
  const { current_password, new_password } = body

  if (!current_password || !new_password) {
    return NextResponse.json(
      { error: 'current_password and new_password are required' },
      { status: 400 },
    )
  }

  if (new_password.length < 8) {
    return NextResponse.json(
      { error: 'new_password must be at least 8 characters' },
      { status: 400 },
    )
  }

  //fetch current hash from auth_credentials
  const { data: credential, error: credentialError } = await findCredentialByProfileId(auth.user.id)

  if (credentialError || !credential) {
    return NextResponse.json({ error: 'Credential record not found' }, { status: 404 })
  }

  //old pass mismatch => 401
  if (!verifyPassword(current_password, credential.password_hash)) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
  }

  //don't allow same old/new password
  if (verifyPassword(new_password, credential.password_hash)) {
    return NextResponse.json(
      { error: 'New password must be different from current password' },
      { status: 400 },
    )
  }

  //write newly hashed password
  const { error: updateError } = await updatePasswordHash(auth.user.id, hashPassword(new_password))

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 })
}
