import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

const SUPPORT_EMAIL = 'support@ploutoslabs.io';

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  email: string;
  subject: string;
}

export function ContactSupport() {
  const navigate = useNavigate();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const supportOptions: SupportOption[] = [
    {
      id: 'email',
      title: 'Email Support',
      description: 'Get help from our support team',
      icon: <Mail className="h-6 w-6 text-kaviBlue" />,
      email: SUPPORT_EMAIL,
      subject: 'Support Request - KaviPay Web App',
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      description: 'Share your thoughts and suggestions',
      icon: <MessageCircle className="h-6 w-6 text-kaviBlue" />,
      email: SUPPORT_EMAIL,
      subject: 'Feedback - KaviPay Web App',
    },
  ];

  const handleEmailClick = (option: SupportOption) => {
    const mailtoUrl = `mailto:${option.email}?subject=${encodeURIComponent(option.subject)}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Contact Support</h1>
      </div>

      {/* Get Help Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Get Help</h2>
          <p className="text-muted-foreground">
            Need assistance with your wallet or have questions? Our support team is here to help.
          </p>
        </div>

        {/* Support Options */}
        <div className="space-y-3">
          {supportOptions.map((option) => (
            <Card key={option.id} className="overflow-hidden">
              <CardContent className="p-0">
                <button
                  onClick={() => handleEmailClick(option)}
                  className="flex w-full items-start gap-4 p-5 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex-shrink-0 mt-0.5">{option.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{option.title}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {option.description}
                    </p>
                    <span className="text-sm text-kaviBlue font-medium">
                      {option.email}
                    </span>
                  </div>
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Copy Email Section */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground mb-2">
            Or copy our email address:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-background rounded border border-border text-sm font-mono text-foreground">
              {SUPPORT_EMAIL}
            </code>
            <button
              onClick={handleCopyEmail}
              className="px-4 py-2 bg-kaviBlue text-white rounded-lg text-sm font-medium hover:bg-kaviBlue/90 transition-colors"
            >
              {copiedEmail ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactSupport;
