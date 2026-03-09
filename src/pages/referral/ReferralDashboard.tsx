import { useState, useEffect } from 'react';
import { useReferral } from '@/contexts/ReferralContext';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  Settings,
  TrendingUp,
  Copy,
  Share2,
  Eye,
  ArrowDownCircle,
  Gift,
  Clock,
  CheckCircle,
  DollarSign,
  Percent,
  ExternalLink,
  Calendar,
  Mail,
  Search,
  Download,
  ArrowUpDown,
  ChevronDown,
  User,
  Shield,
  Lock,
  AlertTriangle,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  List,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type TabType = 'dashboard' | 'referrals' | 'wallet' | 'transactions' | 'settings';

const TABS: { id: TabType; label: string; icon: typeof Users }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'referrals', label: 'Referrals', icon: Users },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function ReferralDashboard() {
  // Get data from ReferralContext
  const {
    referralCode,
    referralLink,
    referralStats,
    referrals,
    wallet,
    transactions,
    profile,
    dashboard,
    isLoading,
    isWalletLoading,
    isTransactionsLoading,
    isProfileLoading,
    isDashboardLoading,
    referralsPagination,
    transactionsPagination,
    loadTransactions,
    refreshAll,
  } = useReferral();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  // Transaction tab state
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'commission' | 'withdrawal' | 'bonus'>('all');
  const [txStatusFilter, setTxStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [txDateFilter, setTxDateFilter] = useState<'7days' | '30days' | '90days' | 'all'>('30days');

  // Referrals tab state
  const [referralSearch, setReferralSearch] = useState('');
  const [referralPage, setReferralPage] = useState(1);
  const referralsPerPage = 5;

  // Load transactions when switching to transactions tab
  useEffect(() => {
    if (activeTab === 'transactions' && transactions.length === 0) {
      loadTransactions();
    }
  }, [activeTab, transactions.length, loadTransactions]);

  const handleCopy = (type: 'code' | 'link') => {
    const text = type === 'code' ? referralCode : referralLink;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join KaviPay',
          text: `Use my referral code ${referralCode} to sign up on KaviPay and earn rewards!`,
          url: referralLink,
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled');
      }
    } else {
      handleCopy('link');
    }
  };

  const handleRefresh = () => {
    refreshAll();
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString()}`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signup':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'earning':
        return <Gift className="h-4 w-4 text-emerald-500" />;
      case 'withdrawal':
        return <ArrowDownCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Filter referrals based on search
  const filteredReferrals = referrals.filter((user) => {
    if (!referralSearch) return true;
    return (
      user.name?.toLowerCase().includes(referralSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(referralSearch.toLowerCase()) ||
      user.code?.toLowerCase().includes(referralSearch.toLowerCase())
    );
  });

  // Filter transactions based on filters
  const filteredTransactions = transactions.filter((tx) => {
    if (txTypeFilter !== 'all' && tx.type !== txTypeFilter) return false;
    if (txStatusFilter !== 'all' && tx.status !== txStatusFilter) return false;
    if (txSearch && !tx.description?.toLowerCase().includes(txSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Referral Dashboard</h1>
          <p className="text-muted-foreground">Track your referrals and earnings</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || isDashboardLoading}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", (isLoading || isDashboardLoading) && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content - Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Total Earnings */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-100">Total Earnings</p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {isDashboardLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          formatCurrency(dashboard.totalEarnings || referralStats.totalBonus || 0)
                        )}
                      </p>
                    </div>
                    <div className="rounded-full bg-white/20 p-3">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-emerald-100">
                    {dashboard.growthRate > 0 ? `+${dashboard.growthRate}% from last month` : 'Lifetime earnings'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Balance */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-100">Wallet Balance</p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {isWalletLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          formatCurrency(wallet.balance || dashboard.walletBalance || 0)
                        )}
                      </p>
                    </div>
                    <div className="rounded-full bg-white/20 p-3">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-blue-100">Available for withdrawal</p>
                </div>
              </CardContent>
            </Card>

            {/* Pending Rewards */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-100">Pending Rewards</p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {isDashboardLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          formatCurrency(wallet.pendingBalance || dashboard.pendingRewards || referralStats.pendingBonus || 0)
                        )}
                      </p>
                    </div>
                    <div className="rounded-full bg-white/20 p-3">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-amber-100">Processing soon</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second Row - Referral Code, Quick Actions, Performance */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Your Referral Code */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground">Your Referral Code</h3>

                {/* Referral Code */}
                <div className="mt-4">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Code
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 rounded-lg bg-muted px-4 py-3 font-mono text-lg font-bold text-foreground">
                      {referralCode || profile.referralCode || '---'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy('code')}
                      className="h-12 w-12 p-0"
                      disabled={!referralCode}
                    >
                      {copied === 'code' ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Referral Link */}
                <div className="mt-4">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Referral Link
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 truncate rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                      {referralLink || profile.referralLink || 'No referral link available'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy('link')}
                      className="h-12 w-12 p-0"
                      disabled={!referralLink}
                    >
                      {copied === 'link' ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* How it works */}
                <div className="mt-5 rounded-lg bg-blue-500/10 p-4">
                  <p className="text-sm leading-relaxed text-foreground">
                    <span className="font-semibold text-blue-600">How it works:</span> Share your
                    referral code or link with friends. When they sign up and make a purchase,
                    you'll earn rewards based on the product's referral structure.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>

                <div className="mt-4 space-y-3">
                  <Button
                    onClick={handleShare}
                    className="w-full justify-start gap-3 bg-gradient-to-r from-kaviBlue to-blue-600 text-white hover:from-kaviBlue/90 hover:to-blue-600/90"
                  >
                    <Share2 className="h-5 w-5" />
                    Share Referral Code
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('referrals')}
                  >
                    <Users className="h-5 w-5" />
                    View Referrals
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('wallet')}
                  >
                    <ArrowDownCircle className="h-5 w-5" />
                    Request Withdrawal
                  </Button>
                </div>

                {/* External Link */}
                <div className="mt-6 border-t border-border pt-4">
                  <a
                    href="https://referral.ploutoslabs.io/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Full Referral Portal
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground">Performance Overview</h3>

                <div className="mt-4 space-y-4">
                  {/* Growth Rate */}
                  <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-emerald-500/20 p-2">
                          <Percent className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Growth Rate</p>
                          <p className="text-lg font-bold text-foreground">
                            {dashboard.growthRate > 0 ? `+${dashboard.growthRate}%` : '0%'}
                          </p>
                        </div>
                      </div>
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                  </div>

                  {/* Avg. per Referral */}
                  <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-500/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-500/20 p-2">
                          <DollarSign className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Avg. per Referral
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {formatCurrency(dashboard.avgPerReferral || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Referrals */}
                  <div className="rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-500/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-purple-500/20 p-2">
                          <Users className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Total Referrals
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {referralStats.totalReferrals}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Recent Activities</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')}>
                  View All
                </Button>
              </div>

              <div className="mt-4 divide-y divide-border">
                {isDashboardLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : dashboard.recentActivities.length > 0 ? (
                  dashboard.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                      {activity.amount && (
                        <p
                          className={cn(
                            'font-semibold',
                            activity.type === 'withdrawal' ? 'text-purple-500' : 'text-emerald-500'
                          )}
                        >
                          {activity.type === 'withdrawal' ? '-' : '+'}
                          {formatCurrency(activity.amount)}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-sm text-muted-foreground">No recent activities</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Referrals Tab - My Referrals */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          {/* Page Title */}
          <h2 className="text-2xl font-bold text-foreground">My Referrals</h2>

          {/* Stats Row - 5 Cards */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {/* Total Referrals */}
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-500">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : referralStats.totalReferrals}
                </p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </CardContent>
            </Card>

            {/* Direct (Level 1) */}
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-500">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : referralStats.directReferrals}
                </p>
                <p className="text-sm text-muted-foreground">Direct (Level 1)</p>
              </CardContent>
            </Card>

            {/* Indirect (Level 2+) */}
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-500">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    referralStats.level2Referrals + referralStats.level3Referrals
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Indirect (Level 2+)</p>
              </CardContent>
            </Card>

            {/* Active */}
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-500">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : referralStats.activeReferrals}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </CardContent>
            </Card>

            {/* Total Earned */}
            <Card className="col-span-2 sm:col-span-1">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-500">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    formatCurrency(referralStats.totalEarnings)
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Total Earned</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search referrals..."
                      value={referralSearch}
                      onChange={(e) => setReferralSearch(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-1 focus:ring-kaviBlue"
                    />
                  </div>

                  {/* Filter Button */}
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>

                {/* Share Referral Code Button */}
                <Button onClick={handleShare} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Referral Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* All Referrals List */}
          <Card>
            <CardContent className="p-0">
              {/* Tab Header */}
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-2 text-kaviBlue border-b-2 border-kaviBlue pb-3 w-fit">
                  <List className="h-4 w-4" />
                  <span className="font-medium">All Referrals</span>
                </div>
              </div>

              {/* Referrals List */}
              <div className="divide-y divide-border">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  filteredReferrals
                    .slice((referralPage - 1) * referralsPerPage, referralPage * referralsPerPage)
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 p-4 sm:px-6 transition-colors hover:bg-muted/50"
                      >
                        {/* Avatar */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 flex-shrink-0">
                          <User className="h-5 w-5" />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                              Level {user.level || 1}
                            </span>
                            <span className={cn(
                              "rounded-md px-2 py-0.5 text-xs font-medium",
                              user.isActive || user.status === 'active'
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-gray-100 text-gray-600"
                            )}>
                              {user.isActive || user.status === 'active' ? 'active' : 'inactive'}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {user.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(user.joinedDate || user.joinedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            {user.code && (
                              <span className="text-muted-foreground">
                                Code: {user.code}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stats - Right Side */}
                        <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{user.referralsCount || 0}</p>
                            <p className="text-xs text-muted-foreground">Referrals</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-500">
                              {formatCurrency(user.earned || user.earnings || 0)}
                            </p>
                            <p className="text-xs text-muted-foreground">Earned</p>
                          </div>
                        </div>

                        {/* Mobile Stats */}
                        <div className="sm:hidden text-right flex-shrink-0">
                          <p className="font-semibold text-emerald-500">
                            {formatCurrency(user.earned || user.earnings || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">Earned</p>
                        </div>
                      </div>
                    ))
                )}

                {/* Empty State */}
                {!isLoading && filteredReferrals.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-semibold text-foreground">No referrals found</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {referralSearch
                        ? 'Try adjusting your search criteria'
                        : 'Start sharing your referral code to see your referrals here'}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredReferrals.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((referralPage - 1) * referralsPerPage) + 1} to{' '}
                    {Math.min(referralPage * referralsPerPage, filteredReferrals.length)} of{' '}
                    {referralsPagination.total || filteredReferrals.length} referrals
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReferralPage(p => Math.max(1, p - 1))}
                      disabled={referralPage === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-kaviBlue text-sm font-medium text-white">
                      {referralPage}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReferralPage(p => p + 1)}
                      disabled={referralPage * referralsPerPage >= filteredReferrals.length}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Available Balance */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <Wallet className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isWalletLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        formatCurrency(wallet.balance)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Balance */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Balance</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isWalletLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        formatCurrency(wallet.pendingBalance)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Earned */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isWalletLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        formatCurrency(wallet.totalEarned)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Withdrawn */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                    <ArrowDownCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Withdrawn</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isWalletLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        formatCurrency(wallet.totalWithdrawn)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                  <p className="text-sm text-muted-foreground">
                    Minimum withdrawal: {formatCurrency(wallet.minimumWithdrawal)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={wallet.balance < wallet.minimumWithdrawal}
                >
                  <ArrowDownCircle className="h-4 w-4" />
                  Request Withdrawal
                </Button>
              </div>

              {/* Warning Message */}
              {wallet.balance < wallet.minimumWithdrawal && (
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                    <span className="text-amber-600 text-sm font-bold">!</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    You need at least {formatCurrency(wallet.minimumWithdrawal)} to request a withdrawal. Current balance:{' '}
                    <span className="font-semibold">
                      {formatCurrency(wallet.balance)}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions & Withdrawal History */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Transactions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setActiveTab('transactions')}
                  >
                    <Clock className="h-4 w-4" />
                    View All
                  </Button>
                </div>

                {/* Transaction List or Empty State */}
                {isTransactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : dashboard.recentActivities.filter(a => a.type === 'earning').length > 0 ? (
                  <div className="divide-y divide-border">
                    {dashboard.recentActivities
                      .filter(a => a.type === 'earning')
                      .slice(0, 3)
                      .map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                            <Gift className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                          <p className="text-sm font-semibold text-emerald-500">
                            +{formatCurrency(activity.amount || 0)}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Receipt className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-sm text-muted-foreground">No recent transactions</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Withdrawal History */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Withdrawal History</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setTxTypeFilter('withdrawal');
                      setActiveTab('transactions');
                    }}
                  >
                    <Clock className="h-4 w-4" />
                    View All
                  </Button>
                </div>

                {/* Withdrawal List or Empty State */}
                {isTransactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : dashboard.recentActivities.filter(a => a.type === 'withdrawal').length > 0 ? (
                  <div className="divide-y divide-border">
                    {dashboard.recentActivities
                      .filter(a => a.type === 'withdrawal')
                      .slice(0, 3)
                      .map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                            <ArrowDownCircle className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            -{formatCurrency(activity.amount || 0)}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ArrowDownCircle className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-sm text-muted-foreground">No withdrawal history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Total Transactions */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <Receipt className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isTransactionsLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        transactionsPagination.total || transactions.length
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Net Amount */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Amount</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isTransactionsLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        formatCurrency(
                          transactions
                            .filter(t => t.status === 'completed')
                            .reduce((sum, t) => sum + (t.type === 'withdrawal' ? -t.amount : t.amount), 0)
                        )
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Period */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Period</p>
                    <p className="text-2xl font-bold text-foreground">
                      {txDateFilter === '7days' ? 'Last 7 days' :
                       txDateFilter === '30days' ? 'Last 30 days' :
                       txDateFilter === '90days' ? 'Last 90 days' : 'All time'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-1 focus:ring-kaviBlue"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Type Filter */}
                  <div className="relative">
                    <select
                      value={txTypeFilter}
                      onChange={(e) => setTxTypeFilter(e.target.value as typeof txTypeFilter)}
                      className="h-10 appearance-none rounded-lg border border-border bg-background pl-4 pr-10 text-sm text-foreground focus:border-kaviBlue focus:outline-none focus:ring-1 focus:ring-kaviBlue"
                    >
                      <option value="all">All Types</option>
                      <option value="commission">Commission</option>
                      <option value="withdrawal">Withdrawal</option>
                      <option value="bonus">Bonus</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={txStatusFilter}
                      onChange={(e) => setTxStatusFilter(e.target.value as typeof txStatusFilter)}
                      className="h-10 appearance-none rounded-lg border border-border bg-background pl-4 pr-10 text-sm text-foreground focus:border-kaviBlue focus:outline-none focus:ring-1 focus:ring-kaviBlue"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>

                  {/* Date Filter */}
                  <div className="relative">
                    <select
                      value={txDateFilter}
                      onChange={(e) => setTxDateFilter(e.target.value as typeof txDateFilter)}
                      className="h-10 appearance-none rounded-lg border border-border bg-background pl-4 pr-10 text-sm text-foreground focus:border-kaviBlue focus:outline-none focus:ring-1 focus:ring-kaviBlue"
                    >
                      <option value="7days">Last 7 days</option>
                      <option value="30days">Last 30 days</option>
                      <option value="90days">Last 90 days</option>
                      <option value="all">All time</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>

                  {/* Export Button */}
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              {/* Table Header */}
              <div className="hidden border-b border-border bg-muted/50 px-6 py-3 lg:grid lg:grid-cols-6 lg:gap-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Transaction
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Type
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Amount
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Details
                </p>
              </div>

              {/* Table Body or Empty State */}
              {isTransactionsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="divide-y divide-border">
                  {filteredTransactions.map((tx) => (
                    <div key={tx.id} className="grid grid-cols-2 gap-2 p-4 lg:grid-cols-6 lg:gap-4 lg:px-6">
                      <div className="col-span-2 lg:col-span-1">
                        <p className="font-medium text-foreground truncate">
                          {tx.description || tx.referralName || `${tx.type} transaction`}
                        </p>
                        <p className="text-xs text-muted-foreground lg:hidden">
                          {tx.date || new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="hidden lg:block">
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          tx.type === 'commission' && 'bg-emerald-100 text-emerald-700',
                          tx.type === 'withdrawal' && 'bg-purple-100 text-purple-700',
                          tx.type === 'bonus' && 'bg-blue-100 text-blue-700'
                        )}>
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </span>
                      </div>
                      <div>
                        <p className={cn(
                          'font-semibold',
                          tx.type === 'withdrawal' ? 'text-foreground' : 'text-emerald-500'
                        )}>
                          {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                        </p>
                      </div>
                      <div>
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          tx.status === 'completed' && 'bg-emerald-100 text-emerald-700',
                          tx.status === 'pending' && 'bg-amber-100 text-amber-700',
                          tx.status === 'failed' && 'bg-red-100 text-red-700'
                        )}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </div>
                      <div className="hidden lg:block">
                        <p className="text-sm text-muted-foreground">
                          {tx.date || new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="hidden lg:block">
                        <Button variant="ghost" size="sm" className="h-8 gap-1 text-kaviBlue">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <ArrowUpDown className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">No transactions found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {txSearch || txTypeFilter !== 'all' || txStatusFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Your transactions will appear here'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Profile Information Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
                </div>
                {isProfileLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div className="border-b border-border pb-4">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="mt-1 font-medium text-foreground">{profile.email || '---'}</p>
                </div>

                {/* Display Name */}
                <div className="border-b border-border pb-4">
                  <p className="text-sm text-muted-foreground">Display Name</p>
                  <p className="mt-1 font-medium text-foreground">{profile.displayName || '---'}</p>
                </div>

                {/* User ID */}
                <div className="border-b border-border pb-4">
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="mt-1 font-mono text-sm text-foreground">{profile.userId || '---'}</p>
                </div>

                {/* Referral Code */}
                <div className="border-b border-border pb-4">
                  <p className="text-sm text-muted-foreground">Referral Code</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="font-mono font-semibold text-foreground">{profile.referralCode || referralCode || '---'}</p>
                    {(profile.referralCode || referralCode) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy('code')}
                        className="h-6 w-6 p-0"
                      >
                        {copied === 'code' ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tier */}
                {profile.tier && (
                  <div className="border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground">Tier</p>
                    <p className="mt-1 font-medium text-foreground">{profile.tier}</p>
                  </div>
                )}

                {/* Commission Rate */}
                {profile.commissionRate > 0 && (
                  <div className="border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground">Commission Rate</p>
                    <p className="mt-1 font-medium text-foreground">{profile.commissionRate}%</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button className="gap-2">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">Security</h3>
              </div>

              <div className="space-y-4">
                {/* Password */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="font-medium text-foreground">Password</p>
                    <p className="text-sm text-muted-foreground">Change your account password</p>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Lock className="h-4 w-4" />
                    Change Password
                  </Button>
                </div>

                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <span className="text-sm text-muted-foreground">Coming soon</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">Preferences</h3>
              </div>

              <div className="space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
                  </div>
                  <span className="text-sm text-muted-foreground">Coming soon</span>
                </div>

                {/* Language */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Language</p>
                    <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">{profile.language || 'English'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone Card */}
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-red-500">Danger Zone</h3>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-500">Delete Account</p>
                  <p className="text-sm text-red-400">Permanently delete your account and all associated data</p>
                </div>
                <Button
                  variant="outline"
                  className="gap-2 border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ReferralDashboard;
