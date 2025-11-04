'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Session, SessionType, SessionLevel } from '@/types/database';

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    session_date: '',
    duration_minutes: 90,
    zoom_link: '',
    zoom_meeting_id: '',
    zoom_passcode: '',
    max_capacity: 100,
    price: 0,
    status: 'upcoming' as Session['status'],
    is_free: false,
    session_type: 'spark101' as SessionType,
    description: '',
    level: 'beginner' as SessionLevel,
    tags: [] as string[],
  });

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/sessions/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        
        // Format date for datetime-local input
        const sessionDate = new Date(data.session.session_date);
        const formattedDate = sessionDate.toISOString().slice(0, 16);
        
        setFormData({
          title: data.session.title,
          session_date: formattedDate,
          duration_minutes: data.session.duration_minutes,
          zoom_link: data.session.zoom_link,
          zoom_meeting_id: data.session.zoom_meeting_id || '',
          zoom_passcode: data.session.zoom_passcode || '',
          max_capacity: data.session.max_capacity,
          price: data.session.price,
          status: data.session.status,
          is_free: data.session.is_free || data.session.price === 0,
          session_type: data.session.session_type || 'spark101',
          description: data.session.description || '',
          level: data.session.level || 'beginner',
          tags: data.session.tags || [],
        });
      } else {
        router.push('/admin/sessions');
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      router.push('/admin/sessions');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (params.id) {
      fetchSession();
    }
  }, [params.id, fetchSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/sessions/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          session_date: new Date(formData.session_date).toISOString(),
        }),
      });

      if (res.ok) {
        router.push(`/admin/sessions/${params.id}`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update session');
      }
    } catch (error) {
      console.error('Failed to update session:', error);
      alert('Failed to update session');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        // If marking as free, set price to 0
        ...(name === 'is_free' && checked ? { price: 0 } : {}),
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/5 rounded-lg w-64"></div>
          <div className="h-96 bg-white/5 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Session not found</h2>
          <Button onClick={() => router.push('/admin/sessions')}>
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => router.push(`/admin/sessions/${params.id}`)}
          variant="ghost"
          className="mb-4 text-gray-400 hover:text-white"
        >
          ← Back to Session
        </Button>
        <h1 className="font-instrument-serif text-3xl font-bold mb-2">
          Edit Session
        </h1>
        <p className="text-gray-400">Update session details</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Session Title *
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="bg-white/[0.03] border-white/10 text-white"
              placeholder="e.g., Spark 101: Introduction to AI"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date & Time *
              </label>
              <Input
                type="datetime-local"
                name="session_date"
                value={formData.session_date}
                onChange={handleChange}
                required
                className="bg-white/[0.03] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes) *
              </label>
              <Input
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                required
                min="1"
                className="bg-white/[0.03] border-white/10 text-white"
              />
            </div>
          </div>

          {/* Zoom Details */}
          <div className="space-y-4">
            <h3 className="font-instrument-serif text-lg font-bold">
              Zoom Meeting Details
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zoom Link *
              </label>
              <Input
                type="url"
                name="zoom_link"
                value={formData.zoom_link}
                onChange={handleChange}
                required
                className="bg-white/[0.03] border-white/10 text-white"
                placeholder="https://zoom.us/j/..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meeting ID (optional)
                </label>
                <Input
                  type="text"
                  name="zoom_meeting_id"
                  value={formData.zoom_meeting_id}
                  onChange={handleChange}
                  className="bg-white/[0.03] border-white/10 text-white"
                  placeholder="123 456 7890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Passcode (optional)
                </label>
                <Input
                  type="text"
                  name="zoom_passcode"
                  value={formData.zoom_passcode}
                  onChange={handleChange}
                  className="bg-white/[0.03] border-white/10 text-white"
                  placeholder="abc123"
                />
              </div>
            </div>
          </div>

          {/* Capacity & Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Capacity *
              </label>
              <Input
                type="number"
                name="max_capacity"
                value={formData.max_capacity}
                onChange={handleChange}
                required
                min={session.current_enrollments}
                className="bg-white/[0.03] border-white/10 text-white"
              />
              {session.current_enrollments > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Current enrollments: {session.current_enrollments}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price (₹) *
              </label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                disabled={formData.is_free}
                className="bg-white/[0.03] border-white/10 text-white disabled:opacity-50"
              />
            </div>
          </div>

          {/* Free Session Toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="is_free"
              checked={formData.is_free}
              onCheckedChange={(checked) => {
                setFormData((prev) => ({
                  ...prev,
                  is_free: checked,
                  price: checked ? 0 : prev.price,
                }));
              }}
            />
            <Label htmlFor="is_free" className="text-sm text-gray-300 cursor-pointer">
              This is a free session (no payment required)
            </Label>
          </div>

          {/* Session Type & Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="session_type" className="text-gray-300">
                Session Type *
              </Label>
              <Select
                value={formData.session_type}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, session_type: value as SessionType }));
                }}
              >
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  <SelectItem value="spark101" className="text-white focus:bg-white/10 focus:text-white">
                    ⚡ Spark 101
                  </SelectItem>
                  <SelectItem value="framework101" className="text-white focus:bg-white/10 focus:text-white">
                    🔧 Framework 101
                  </SelectItem>
                  <SelectItem value="summit101" className="text-white focus:bg-white/10 focus:text-white">
                    🏔️ Summit 101
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level" className="text-gray-300">
                Level *
              </Label>
              <Select
                value={formData.level}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, level: value as SessionLevel }));
                }}
              >
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  <SelectItem value="beginner" className="text-white focus:bg-white/10 focus:text-white">
                    Beginner
                  </SelectItem>
                  <SelectItem value="intermediate" className="text-white focus:bg-white/10 focus:text-white">
                    Intermediate
                  </SelectItem>
                  <SelectItem value="advanced" className="text-white focus:bg-white/10 focus:text-white">
                    Advanced
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Description
            </Label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 text-white rounded-lg focus:border-purple-500/50 focus:ring-purple-500/20 resize-none"
              placeholder="Describe what students will learn in this session..."
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-gray-300">
              Tags (comma-separated)
            </Label>
            <Input
              type="text"
              name="tags"
              value={formData.tags.join(', ')}
              onChange={(e) => {
                const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                setFormData((prev) => ({ ...prev, tags: tagsArray }));
              }}
              className="bg-white/[0.03] border-white/10 text-white"
              placeholder="AI, Machine Learning, Python"
            />
            <p className="text-xs text-gray-500">
              Separate tags with commas
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-300">
              Status *
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, status: value as Session['status'] }));
              }}
            >
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="upcoming" className="text-white focus:bg-white/10 focus:text-white">
                  Upcoming
                </SelectItem>
                <SelectItem value="ongoing" className="text-white focus:bg-white/10 focus:text-white">
                  Ongoing
                </SelectItem>
                <SelectItem value="completed" className="text-white focus:bg-white/10 focus:text-white">
                  Completed
                </SelectItem>
                <SelectItem value="cancelled" className="text-white focus:bg-white/10 focus:text-white">
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Warning for sessions with enrollments */}
          {session.current_enrollments > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">
                ⚠️ This session has {session.current_enrollments} enrollments. 
                Significant changes may affect enrolled users.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="bg-white text-black hover:bg-gray-100 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              onClick={() => router.push(`/admin/sessions/${params.id}`)}
              variant="outline"
              className="border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.05]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
