import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { apiService } from "@/services/api_service";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp" | "reset" | "success">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [meetsThreeConditions, setMeetsThreeConditions] = useState(false);

  useEffect(() => {
    if (step === "otp" && !canResend) {
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, canResend]);

  useEffect(() => {
    setHasMinLength(newPassword.length >= 8);
    setHasLowerCase(/[a-z]/.test(newPassword));
    setHasUpperCase(/[A-Z]/.test(newPassword));
    setHasNumber(/[0-9]/.test(newPassword));
    setHasSpecialChar(/[!@#\$%^&*(),.?":{}|<>]/.test(newPassword));

    let conditionsMet = 0;
    if (/[a-z]/.test(newPassword)) conditionsMet++;
    if (/[A-Z]/.test(newPassword)) conditionsMet++;
    if (/[0-9]/.test(newPassword)) conditionsMet++;
    if (/[!@#\$%^&*(),.?":{}|<>]/.test(newPassword)) conditionsMet++;

    setMeetsThreeConditions(conditionsMet >= 3);
  }, [newPassword]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      await apiService.sendOTP({ email });
      toast.success("OTP sent to your email!");
      setStep("otp");
      setCanResend(false);
      setSecondsRemaining(30);
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      toast.error("Please enter complete OTP");
      return;
    }

    try {
      setLoading(true);
      await apiService.verifyOTP({ email, otp: otpValue });
      toast.success("OTP verified!");
      setStep("reset");
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || resendLoading) return;

    try {
      setResendLoading(true);
      await apiService.resendOTP({ email });
      toast.success("OTP sent successfully!");
      setCanResend(false);
      setSecondsRemaining(30);
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!meetsThreeConditions) {
      toast.error("Password must meet the requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      await apiService.forgotPassword({
        email,
        password: newPassword,
        confirmPassword,
      });
      setStep("success");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const buildRequirement = (text: string, isMet: boolean) => (
    <div className="flex items-center gap-2 py-1">
      <CheckCircle2
        className={`w-4 h-4 ${isMet ? "text-green-500" : "text-gray-400"}`}
      />
      <span className={`text-sm ${isMet ? "text-green-500" : "text-gray-700"}`}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <Card className="w-full max-w-md p-8 shadow-elevated">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl">
            B
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {step === "success" ? "Success!" : "Reset Password"}
          </h1>
          <p className="text-muted-foreground">
            {step === "email" && "Enter your email to receive OTP"}
            {step === "otp" && "Enter the 4-digit code sent to your email"}
            {step === "reset" && "Create a new password"}
            {step === "success" && "Your password has been reset"}
          </p>
        </div>

        {step === "success" ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-4 animate-scale-in" />
            <p className="text-muted-foreground">Redirecting to login...</p>
          </div>
        ) : (
          <>
            {step === "email" && (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@baubles.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-12 h-12 text-center text-lg font-semibold"
                      disabled={loading}
                    />
                  ))}
                </div>
                <div className="text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendLoading}
                      className="text-primary hover:underline text-sm"
                    >
                      {resendLoading ? "Sending..." : "Resend Code"}
                    </button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Resend Code in {secondsRemaining}s
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium mb-3">Your password must contain:</p>
                  {buildRequirement("At least 8 characters", hasMinLength)}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 py-1">
                      <CheckCircle2
                        className={`w-4 h-4 ${meetsThreeConditions ? "text-green-500" : "text-gray-400"
                          }`}
                      />
                      <span
                        className={`text-sm font-medium ${meetsThreeConditions ? "text-green-500" : "text-gray-700"
                          }`}
                      >
                        At least 3 of the following:
                      </span>
                    </div>
                    <div className="ml-6 space-y-1">
                      {buildRequirement("Lower case letters (a-z)", hasLowerCase)}
                      {buildRequirement("Upper case letters (A-Z)", hasUpperCase)}
                      {buildRequirement("Numbers (0-9)", hasNumber)}
                      {buildRequirement("Special characters (e.g. !@#$%^&*)", hasSpecialChar)}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Enter your confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Updating..." : "Reset Password"}
                </Button>
              </form>
            )}

            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}