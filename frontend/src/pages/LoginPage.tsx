import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Button } from "../components/ui/Button";
import { FormMessage } from "../components/ui/FormMessage";
import { getErrorMessage } from "../utils/errors";

const schema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Enter a valid email address")
    .refine((value) => value.endsWith("@umak.edu.ph"), "Use your @umak.edu.ph account"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { requestOtp, pendingEmail } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: pendingEmail ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => requestOtp(values.email),
    onSuccess: () => navigate("/verify"),
    onError: (error) => {
      setError("email", { message: getErrorMessage(error) });
    },
  });

  const onSubmit = handleSubmit((values) => mutation.mutate(values));

  return (
    <div className="mx-auto max-w-md">
      <div className="animate-slide-up space-y-10">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300">
            <Mail className="h-3.5 w-3.5" />
            Secure Access
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Sign in with your UMak email</h1>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">
            We'll send a one-time passcode to your institutional inbox. No passwords to remember, only verified votes.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/60">
          <div className="space-y-2">
            <Label htmlFor="email">UMak email address</Label>
            <Input 
              id="email" 
              type="email" 
              autoComplete="email" 
              placeholder="you@umak.edu.ph" 
              {...register("email")}
            />
            {errors.email && <FormMessage intent="error">{errors.email.message}</FormMessage>}
          </div>
          
          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? "Sending code..." : "Send one-time code"}
          </Button>
          
          {mutation.isSuccess && (
            <FormMessage intent="success" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              ✓ We sent a 6-digit code to your inbox. Check your email.
            </FormMessage>
          )}
          {mutation.isError && !errors.email && (
            <FormMessage intent="error" className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-500/30 dark:bg-rose-500/10">
              {getErrorMessage(mutation.error)}
            </FormMessage>
          )}
        </form>

        {/* Help Text */}
        <p className="text-center text-xs text-gray-600 dark:text-slate-500">
          💡 Tip: keep this window open while checking your email. Codes expire after five minutes for your safety.
        </p>
      </div>
    </div>
  );
}
