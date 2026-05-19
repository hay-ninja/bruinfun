import { useState } from 'react';

function InputField({ placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      style={styles.input}
    />
  );
}

function TabBar({ activeTab, onTabChange }) {
  const tabs = ['Sign In', 'Log In'];
  return (
    <div style={styles.tabsWrapper}>
      <div style={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{ ...styles.tab, opacity: tab === activeTab ? 1 : 0.4 }}
          >
            {tab}
            {tab === activeTab && <span style={styles.activeBar} />}
          </button>
        ))}
      </div>
      <div style={styles.divider} />
    </div>
  );
}

function LoginCard() {
  const [activeTab, setActiveTab] = useState('Sign In');

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>BruinFun</h1>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <InputField placeholder="Username" />
      <InputField placeholder="Password" type="password" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={styles.page}>
      <LoginCard />
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#fafafa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
  },
  card: {
    width: 359,
    background: 'rgba(235, 235, 235, 0.17)',
    border: '1.5px solid rgba(199, 199, 199, 0.33)',
    borderRadius: 36,
    padding: '36px 22px 52px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 600,
    letterSpacing: '-0.36px',
    color: '#000',
    margin: 0,
  },
  tabsWrapper: {
    width: '100%',
  },
  tabs: {
    display: 'flex',
    gap: 56,
    paddingLeft: 16,
    paddingBottom: 10,
  },
  tab: {
    background: 'none',
    border: 'none',
    fontSize: 18,
    fontWeight: 500,
    letterSpacing: '-0.72px',
    color: '#000',
    cursor: 'pointer',
    padding: 0,
    position: 'relative',
    fontFamily: 'inherit',
  },
  activeBar: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    height: 3,
    background: '#000',
    borderRadius: 2,
    display: 'block',
  },
  divider: {
    height: 1,
    background: '#e0e0e0',
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '14px 20px',
    background: 'rgba(120, 120, 120, 0.10)',
    border: 'none',
    borderRadius: 999,
    fontSize: 20,
    color: '#949494',
    fontFamily: 'inherit',
    outline: 'none',
  },
};
