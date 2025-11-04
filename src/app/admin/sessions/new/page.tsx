'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { SessionType, SessionLevel, Session } from '@/types/database';

export default function NewSessionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [lastPaidPrice, setLastPaidPrice] = useState(999);
  const [formData, setFormData] = useState({
    title: '',
    session_date: '',
    duration_minutes: 90,
    zoom_link: '',
    zoom_meeting_id: '',
    zoom_passcode: '',
    max_capacity: 100,
    price: 999,
    status: 'upcoming',
    is_free: false,
    session_type: 'spark101' as SessionType,
    description: '',
    level: 'beginner' as SessionLevel,
    tags: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          session_date: new Date(formData.session_date).toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/sessions/${data.session.id}`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseInt(value) || 0 : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    
    // Track last paid price when price is changed and not free
    if (name === 'price' && typeof newValue === 'number' && newValue > 0 && !formData.is_free) {
      setLastPaidPrice(newValue);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => router.push('/admin/sessions')}
          variant="ghost"
          className="mb-4 text-gray-400 hover:text-white"
        >
          ← Back to Sessions
        </Button>
        <h1 className="font-instrument-serif text-3xl font-bold mb-2">
          Create New Session
        </h1>
        <p className="text-gray-400">Add a new Spark 101 session</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">
              Session Title *
            </Label>
            <Input
              id="title"
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
            <div className="space-y-2">
              <Label htmlFor="session_date" className="text-gray-300">
                Date & Time *
              </Label>
              <Input
                id="session_date"
                type="datetime-local"
                name="session_date"
                value={formData.session_date}
                onChange={handleChange}
                required
                className="bg-white/[0.03] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes" className="text-gray-300">
                Duration (minutes) *
              </Label>
              <Input
                id="duration_minutes"
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
            <div className="space-y-2">
              <Label htmlFor="zoom_link" className="text-gray-300">
                Zoom Link *
              </Label>
              <Input
                id="zoom_link"
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
              <div className="space-y-2">
                <Label htmlFor="zoom_meeting_id" className="text-gray-300">
                  Meeting ID (optional)
                </Label>
                <Input
                  id="zoom_meeting_id"
                  type="text"
                  name="zoom_meeting_id"
                  value={formData.zoom_meeting_id}
                  onChange={handleChange}
                  className="bg-white/[0.03] border-white/10 text-white"
                  placeholder="123 456 7890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoom_passcode" className="text-gray-300">
                  Passcode (optional)
                </Label>
                <Input
                  id="zoom_passcode"
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
            <div className="space-y-2">
              <Label htmlFor="max_capacity" className="text-gray-300">
                Max Capacity *
              </Label>
              <Input
                id="max_capacity"
                type="number"
                name="max_capacity"
                value={formData.max_capacity}
                onChange={handleChange}
                required
                min="1"
                className="bg-white/[0.03] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-gray-300">
                Price (₹) *
              </Label>
              <Input
                id="price"
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
                  price: checked ? 0 : lastPaidPrice,
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
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
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

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="bg-white text-black hover:bg-gray-100 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Session'}
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/admin/sessions')}
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