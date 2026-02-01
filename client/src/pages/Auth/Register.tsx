import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { MultiSelect } from '../../components/UI/MultiSelect';
import { Button } from '../../components/UI/Button';
import { Search, User } from 'lucide-react';
import toast from 'react-hot-toast';
// import countryList from 'react-select-country-list';
import { newCountryOptions, countryOptions, industryOptions, currentPositionOptions } from "../../utils/options";
import { allCountries } from 'country-telephone-data';

const allRoleOptions  = [
  { value: 'job_seeker', label: 'Job Seeker' },
  { value: 'employer', label: 'Employer' },
];

export function Register() {
    const [open, setOpen] = useState(false);
const countryCodeOptions = allCountries.map((country) => ({
  value: `+${country.dialCode}`,
  label: `${country.name} (+${country.dialCode})`,
}));
  
  const [searchParams] = useSearchParams();
  // const countryOptions = useMemo(() => countryList().getData(), []); // full country list
   const roleFromUrl = searchParams.get('role');

  const roleOptions = useMemo(() => {
    if (roleFromUrl === 'employer') {
      return allRoleOptions.filter(option => option.value === 'employer');
    }
    if (roleFromUrl === 'job_seeker') {
      return allRoleOptions.filter(option => option.value === 'job_seeker');
    }
    return allRoleOptions;
  }, [roleFromUrl]);
 



  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: searchParams.get('role') || 'job_seeker',
    phone: '',
    country: 'AE', // default United Arab Emirates
    countryCode: '+971',
    interests: [] as string[], // Array of selected industry interests (for job seekers)
  });

  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate interests for job seekers
    if (formData.role === 'job_seeker' && formData.interests.length === 0) {
      toast.error('Please select at least one job interest');
      return;
    }

    const finalFormData = {
      ...formData,
      phone: `${formData.countryCode} ${formData.phone.replace(/^0+/, '')}`, // remove leading 0
      interests: formData.role === 'job_seeker' ? formData.interests : undefined, // Only include interests for job seekers
      interests_selected: formData.role === 'job_seeker' ? formData.interests.length > 0 : false,
    };

    console.log(finalFormData, ">>> final data");

    setLoading(true);
    try {
      const newUser = await register(finalFormData);
      toast.success("Account created successfully!");
      navigate(newUser.role === "employer" ? "/employer" : "/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-10 w-10 text-blue-600" />
                <User className="h-5 w-5 text-blue-600 absolute -top-1 -right-1" />
              </div>
              <div>
                <span className="text-3xl font-bold text-blue-600">BAHATH</span>
                <span className="text-3xl font-bold text-blue-800 ml-1">JOBZ</span>
              </div>
            </div>
          </Link>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

            <div className="grid grid-cols-3 gap-3">
           
<div className="relative">
      <label
        htmlFor="countryCode"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Code <span className="text-red-500">*</span>
      </label>

      {/* Visible selected value */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-md border border-gray-300 bg-white py-2.5 px-3 text-gray-700 text-sm flex justify-between items-center shadow-sm"
      >
        <span>{formData.countryCode}</span>
        <span className="text-gray-400">▾</span>
      </button>

      {/* Dropdown list */}
      {open && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {countryCodeOptions.map((opt) => (
            <li
              key={opt.value}
              className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-blue-50"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  countryCode: opt.value,
                }));
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>


              <div className="col-span-2">
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>
            {/* Country Dropdown */}
            <Select
              label="Country"
              name="country"
              options={newCountryOptions}
              value={formData.country}
              onChange={handleChange}
              required
            />

            <Select
              label="I am a"
              name="role"
              options={roleOptions}
              value={formData.role}
              onChange={handleChange}
              required
            />

            {/* Interest selection for job seekers */}
            {formData.role === 'job_seeker' && (
              <MultiSelect
                label="Job Interests (Select industries you're interested in)"
                name="interests"
                options={industryOptions}
                value={formData.interests}
                onChange={(selectedInterests) => {
                  setFormData((prev) => ({ ...prev, interests: selectedInterests }));
                }}
                placeholder="Select your interests..."
                required
                maxHeight="250px"
              />
            )}

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />

            <div className="text-sm text-gray-600">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
