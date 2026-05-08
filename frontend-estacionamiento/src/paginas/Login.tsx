import { SignIn } from '@clerk/clerk-react';

export default function Login() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#2c3e50' }}>
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
