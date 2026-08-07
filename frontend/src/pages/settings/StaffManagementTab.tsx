import React, { useState, useEffect } from 'react';
import { storeService, type StoreMember } from '../../services/store';
import { Button, Card, Input, Skeleton } from '../../components/shared';
import { Users, UserPlus, Trash2, Lock, CheckCircle2 } from 'lucide-react';
import styles from './SettingsPages.module.css';

interface StaffManagementTabProps {
  isOwner: boolean;
}

export const StaffManagementTab: React.FC<StaffManagementTabProps> = ({ isOwner }) => {
  const [members, setMembers] = useState<StoreMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviting, setInviting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await storeService.getStoreMembers();
      if (res.success && res.data) {
        setMembers(res.data.members || []);
      }
    } catch (err) {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    if (!inviteEmail.trim()) {
      setError('Staff email address is required');
      return;
    }

    setInviting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await storeService.inviteMember({
        email: inviteEmail.trim(),
        name: inviteName.trim() || undefined,
        role: 'staff',
      });

      if (res.success) {
        setInviteEmail('');
        setInviteName('');
        setSuccessMsg('Staff member invitation sent successfully!');
        loadMembers();
      } else {
        setError((res as any).message || 'Failed to invite staff member');
      }
    } catch (err: any) {
      setError(err.message || 'Error inviting staff member');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string, memberName: string, role: string) => {
    if (!isOwner) return;
    if (role === 'owner') {
      alert('You cannot revoke access for the Store Owner account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to revoke access for staff member '${memberName}'?`)) return;

    setError(null);
    setSuccessMsg(null);

    try {
      const res = await storeService.removeMember(memberId);
      if (res.success) {
        setSuccessMsg('Staff member access revoked');
        loadMembers();
      } else {
        setError((res as any).message || 'Failed to revoke staff access');
      }
    } catch (err: any) {
      setError(err.message || 'Error revoking staff access');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {!isOwner && (
        <Card style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3B82F6', fontSize: '13px' }}>
            <Lock size={18} />
            <span>
              <strong>Read-Only Mode:</strong> Only Store Owners can invite or revoke staff member accounts.
            </span>
          </div>
        </Card>
      )}

      {successMsg && (
        <Card style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--state-success)', fontSize: '13px' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        </Card>
      )}

      {/* Invite Member Card (Owner Only) */}
      {isOwner && (
        <Card>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Invite New Staff Member
          </h3>

          <form onSubmit={handleInvite} className={styles.formGrid}>
            {error && (
              <div style={{ color: 'var(--state-error)', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <Input
              label="Staff Email Address *"
              type="email"
              placeholder="e.g. cashier@store.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />

            <Input
              label="Staff Full Name (Optional)"
              placeholder="e.g. Ramesh Kumar"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <Button
                type="submit"
                variant="primary"
                isLoading={inviting}
                leftIcon={<UserPlus size={16} />}
              >
                Send Invite
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Staff Directory Card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Users size={18} style={{ color: '#3B82F6' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Active Store Team Members ({members.length})
          </h3>
        </div>

        {loading ? (
          <Skeleton height={200} />
        ) : members.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No staff members registered yet.
          </div>
        ) : (
          <div className="table-responsive-container">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  {isOwner && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const isOwnerRole = m.role === 'owner';
                  return (
                    <tr key={m.id}>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{m.name || 'Staff Member'}</strong>
                      </td>
                      <td>
                        <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                          {m.email}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.roleBadge} ${
                            isOwnerRole ? styles.roleOwner : styles.roleStaff
                          }`}
                        >
                          {m.role}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {m.status.toUpperCase()}
                        </span>
                      </td>
                      {isOwner && (
                        <td>
                          {!isOwnerRole && (
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Trash2 size={14} />}
                              onClick={() => handleRemove(m.id, m.name || m.email, m.role)}
                            >
                              Revoke
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StaffManagementTab;
