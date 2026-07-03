import { useState } from 'react';
import { Check } from 'lucide-react';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
    setEmail('');
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'row', gap: 16, alignItems: 'center' }}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        style={{
          width: 380,
          height: 60,
          padding: '0 24px',
          borderRadius: 12,
          border: '1px solid #BC6A4D',
          background: 'rgba(255,255,255,0.04)',
          color: '#ffffff',
          fontSize: 16,
          outline: 'none',
        }}
        className="placeholder:text-white/35"
      />
      <button
        type="submit"
        disabled={isLoading || isSubmitted}
        style={{
          width: 180,
          height: 60,
          borderRadius: 12,
          background: '#BC6A4D',
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 500,
          border: 'none',
          cursor: 'pointer',
          flexShrink: 0,
          opacity: isLoading || isSubmitted ? 0.75 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {isSubmitted ? (
          <><Check size={16} /> Subscribed!</>
        ) : isLoading ? (
          <span className="animate-spin">✦</span>
        ) : (
          'Subscribe'
        )}
      </button>
    </form>
  );
};

export default NewsletterForm;
