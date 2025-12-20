import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Camera, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { apiService } from "@/services/api_service";
import { AdminProfile as AdminProfileType } from "@/services/api_types";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { parsePhoneNumber } from 'libphonenumber-js';

const COUNTRY_PHONE_LENGTHS: { [key: string]: number } = {
  'IN': 10,
  'US': 10,
  'GB': 10,
  'CA': 10,
  'AU': 9,
  'NZ': 9,
  'DE': 11,
  'FR': 9,
  'IT': 10,
  'ES': 9,
  'BR': 11,
  'MX': 10,
  'JP': 10,
  'CN': 11,
  'KR': 10,
  'RU': 10,
  'ZA': 9,
  'AE': 9,
  'SA': 9,
  'EG': 10,
  'NG': 10,
  'KE': 9,
  'PK': 10,
  'BD': 10,
  'ID': 11,
  'MY': 10,
  'SG': 8,
  'TH': 9,
  'VN': 9,
  'PH': 10,
  'TR': 10,
  'AR': 10,
  'CL': 9,
  'CO': 10,
  'PE': 9,
  'VE': 10,
};

const ProfileSkeleton = () => (
  <div className="max-w-4xl animate-fade-in space-y-6">
    <div className="h-9 w-48 bg-muted/80 rounded animate-pulse"></div>

    <Card className="shadow-card">
      <CardHeader>
        <div className="h-7 w-40 bg-muted/80 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted/80 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-5 w-32 bg-muted/80 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-muted/80 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted/80 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-muted/80 rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted/80 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-muted/80 rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-28 bg-muted/80 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-muted/80 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="h-10 w-36 bg-muted/80 rounded animate-pulse"></div>
      </CardContent>
    </Card>

    <Card className="shadow-card">
      <CardHeader>
        <div className="h-7 w-40 bg-muted/80 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-muted/80 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-muted/80 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted/80 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-muted/80 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-40 bg-muted/80 rounded animate-pulse"></div>
      </CardContent>
    </Card>
  </div>
);

export default function AdminProfile() {
  const [profile, setProfile] = useState<AdminProfileType | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState<string>("");
  const [countryCode, setCountryCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("IN");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!hasFetched.current) {
        hasFetched.current = true;
        if (isMounted) {
          await fetchProfile();
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAdminProfile();
      if (response.success) {
        setProfile(response.data);
        setName(response.data.name);
        setEmail(response.data.email);
        setMobile(response.data.mobile || "");
        setCountryCode(response.data.countryCode || "");
        setAvatarPreview(response.data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.data.name || 'admin'}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getMaxDigitsForCountry = (country: string): number => {
    return COUNTRY_PHONE_LENGTHS[country] || 15;
  };

  const handlePhoneChange = (value: string | undefined) => {
    if (value) {
      try {
        const phoneNumber = parsePhoneNumber(value);
        if (phoneNumber) {
          const country = phoneNumber.country || 'IN';
          const nationalNumber = phoneNumber.nationalNumber;
          const maxDigits = getMaxDigitsForCountry(country);

          if (nationalNumber.length > maxDigits) {
            return;
          }

          setMobile(value);
          setCountryCode(phoneNumber.countryCallingCode);
          setSelectedCountry(country);
        } else {
          setMobile(value);
        }
      } catch (error) {
        setMobile(value);
      }
    } else {
      setMobile("");
      setCountryCode("");
    }
  };

  const validatePassword = (password: string): string | null => {
    if (!password) {
      return "Please enter a password";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }

    let conditionsMet = 0;

    if (/[a-z]/.test(password)) {
      conditionsMet++;
    }

    if (/[A-Z]/.test(password)) {
      conditionsMet++;
    }

    if (/[0-9]/.test(password)) {
      conditionsMet++;
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      conditionsMet++;
    }

    if (conditionsMet < 3) {
      return "Password must contain at least 3 of the following:\nLowercase letters, Uppercase letters, Numbers, Special characters";
    }

    return null;
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!mobile || !mobile.trim()) {
      toast.error("Mobile number is required");
      return;
    }

    try {
      const phoneNumber = parsePhoneNumber(mobile);
      if (phoneNumber) {
        const country = phoneNumber.country || 'IN';
        const nationalNumber = phoneNumber.nationalNumber;
        const maxDigits = getMaxDigitsForCountry(country);

        if (nationalNumber.length !== maxDigits) {
          toast.error(`Phone number must be exactly ${maxDigits} digits for ${country}`);
          return;
        }
      }
    } catch (error) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setIsLoadingProfile(true);
      const response = await apiService.updateProfile({
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        countryCode: countryCode,
        avatar: avatarFile,
      });
      if (response.success) {
        setProfile(response.data);
        setAvatarFile(null);
        if (response.data.avatar) {
          setAvatarPreview(response.data.avatar);
        }
        toast.success("Profile updated successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    const newPasswordError = validatePassword(newPassword);
    if (newPasswordError) {
      toast.error(newPasswordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      setIsLoadingPassword(true);
      const response = await apiService.changePassword({
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });
      if (response.success) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-4xl animate-fade-in space-y-6">
      <style>{`
        .PhoneInput {
          display: flex;
          align-items: center;
        }
        .PhoneInputInput {
          flex: 1;
          min-width: 0;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          color: inherit !important;
        }
        .PhoneInputCountry {
          margin-right: 0.5rem;
        }
        .PhoneInputCountrySelect {
          background: hsl(var(--background)) !important;
          border: none !important;
          color: hsl(var(--foreground)) !important;
          cursor: pointer;
        }
        .PhoneInputCountrySelect:focus {
          outline: none !important;
        }
        .PhoneInputCountrySelectArrow {
          color: hsl(var(--foreground)) !important;
          opacity: 0.5;
        }
        .PhoneInputCountryIcon {
          width: 1.25rem !important;
          height: 1.25rem !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .PhoneInputCountryIcon img {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .PhoneInputCountryIconImg {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        select.PhoneInputCountrySelect option {
          background: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
        }
      `}</style>

      <h1 className="text-3xl font-bold">Your Profile</h1>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback>{profile ? getInitials(profile.name) : "AD"}</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                onClick={handleAvatarClick}
                type="button"
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h3 className="font-semibold">{profile?.name}</h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              {avatarFile && (
                <p className="text-xs text-green-600 mt-1">New avatar selected</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoadingProfile}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoadingProfile}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <PhoneInput
                  international
                  defaultCountry="IN"
                  value={mobile}
                  onChange={handlePhoneChange}
                  disabled={isLoadingProfile}
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            className="w-full md:w-auto"
            disabled={isLoadingProfile}
          >
            {isLoadingProfile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoadingPassword}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isLoadingPassword}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters and contain 3 of: lowercase, uppercase, numbers, special characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoadingPassword}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoadingPassword}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            className="w-full md:w-auto"
            disabled={isLoadingPassword}
          >
            {isLoadingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}