import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Mail, Bell, Shield } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";

export function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    voteConfirmations: true,
    resultNotifications: true,
    maintenanceMode: false,
    allowAbstain: true,
    otpExpiry: "5",
    maxLoginAttempts: "3",
    sessionTimeout: "12"
  });

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              System Settings
            </h1>
            <p className="mt-2 text-gray-600 dark:text-slate-400">
              Configure system-wide settings and preferences
            </p>
          </div>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-5 w-5" />
          Save Changes
        </Button>
      </div>

      {/* Email Settings */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 text-white">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Email Notifications
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Email Notifications
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Send email notifications to users
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, emailNotifications: e.target.checked })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-slate-700"></div>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Vote Confirmations
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Send confirmation emails after voting
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.voteConfirmations}
                onChange={(e) =>
                  setSettings({ ...settings, voteConfirmations: e.target.checked })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-slate-700"></div>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Result Notifications
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Notify users when results are published
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.resultNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, resultNotifications: e.target.checked })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-slate-700"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-3 text-white">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Security Settings
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="otpExpiry">OTP Expiry Time (minutes)</Label>
            <Input
              id="otpExpiry"
              type="number"
              value={settings.otpExpiry}
              onChange={(e) =>
                setSettings({ ...settings, otpExpiry: e.target.value })
              }
              min="1"
              max="60"
            />
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              How long OTP codes remain valid
            </p>
          </div>

          <div>
            <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
            <Input
              id="maxLoginAttempts"
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) =>
                setSettings({ ...settings, maxLoginAttempts: e.target.value })
              }
              min="1"
              max="10"
            />
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Maximum failed login attempts before lockout
            </p>
          </div>

          <div>
            <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) =>
                setSettings({ ...settings, sessionTimeout: e.target.value })
              }
              min="1"
              max="72"
            />
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              How long users stay logged in
            </p>
          </div>
        </div>
      </div>

      {/* Voting Settings */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-3 text-white">
            <Bell className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Voting Settings
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Allow Abstain Option
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Let voters choose to abstain from voting
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.allowAbstain}
                onChange={(e) =>
                  setSettings({ ...settings, allowAbstain: e.target.checked })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-slate-700"></div>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Maintenance Mode
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Disable voting for system maintenance
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings({ ...settings, maintenanceMode: e.target.checked })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-slate-700"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
