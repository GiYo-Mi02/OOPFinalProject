import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Button } from "../components/ui/Button";
import { FormMessage } from "../components/ui/FormMessage";
import { getErrorMessage } from "../utils/errors";
import { useCountdown } from "../hooks/useCountdown";

const schema = z.object({
  otp: z
    .string({ required_error: "Enter the six-digit code" })
    .length(6, "OTP must be exactly six digits")
    .regex(/^[0-9]+$/, "Digits only"),
});

type FormValues = z.infer<typeof schema>;

export function OtpPage() {
  const navigate = useNavigate();
  const { pendingEmail, verifyOtp, requestOtp, user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { otp: "" },
  });

  const countdown = useCountdown(60, [pendingEmail]);

  useEffect(() => {
    if (!pendingEmail) {
      if (user) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [navigate, pendingEmail, user]);

  const verifyMutation = useMutation({
    mutationFn: (values: FormValues) => verifyOtp(values.otp),
    onSuccess: (user) => {
      // Redirect based on user role
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    },
    onError: (error) => setError("otp", { message: getErrorMessage(error) }),
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      if (!pendingEmail) throw new Error("No email to resend to");
      await requestOtp(pendingEmail);
    },
    onSuccess: () => {
      countdown.restart();
      reset({ otp: "" });
    },
  });

  const onSubmit = handleSubmit((values) => verifyMutation.mutate(values));

  return (
    <div className="mx-auto max-w-md">
      <div className="animate-slide-up space-y-10">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            Two-step verification
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Enter the code we emailed you</h1>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">
            We sent a passcode to{" "}
            <span className="font-semibold text-gray-900 dark:text-slate-200">{pendingEmail}</span>. Codes expire in 5 minutes.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/60">
          <div className="space-y-2">
            <Label htmlFor="otp">One-time passcode</Label>
            <Input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
              {...register("otp")}
            />
            {errors.otp && <FormMessage intent="error">{errors.otp.message}</FormMessage>}
          </div>
          
          <Button type="submit" disabled={verifyMutation.isPending} className="w-full">
            {verifyMutation.isPending ? "Verifying..." : "Verify and continue"}
          </Button>
          
          {verifyMutation.isError && !errors.otp && (
            <FormMessage intent="error" className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-500/30 dark:bg-rose-500/10">
              {getErrorMessage(verifyMutation.error)}
            </FormMessage>
          )}
        </form>

        {/* Resend Section */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-slate-400">
            <RefreshCw className="h-4 w-4" />
            {countdown.remaining > 0 ? (
              <span>Resend available in <span className="font-semibold text-primary-600 dark:text-primary-400">{countdown.remaining}s</span></span>
            ) : (
              <span>You can request a new code</span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={countdown.remaining > 0 || resendMutation.isPending}
            onClick={() => resendMutation.mutate()}
          >
            Resend code
          </Button>
        </div>
      </div>
    </div>
  );
}
