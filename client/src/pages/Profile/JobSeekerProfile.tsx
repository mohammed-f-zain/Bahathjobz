import React, { useState, useEffect } from "react";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { Select } from "../../components/UI/Select";
import { MultiSelect } from "../../components/UI/MultiSelect";
import { User, Upload, Save } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { countryOptions, industryOptions, currentPositionOptions } from "../../utils/options";
import { useAuth } from "../../contexts/AuthContext";
import { allCountries } from 'country-telephone-data';

const COLORS = {
  dark: '#1b3c53',      // Dark navy blue
  medium: '#234c6a',    // Medium blue
  light: '#456882',     // Light blue
  bg: '#e3e3e3',        // Light gray background
  blue: '#1292bf',
  white: '#ffffff',
  text: '#1f2937',
  textLight: '#6b7280',
};

const availabilityOptions = [
  { value: "", label: "Select Availability" },
  { value: "Immediately", label: "Immediately" },
  { value: "1 week", label: "1 week" },
  { value: "2 weeks", label: "2 weeks" },
  { value: "1 month", label: "1 month" },
  { value: "2-3 months", label: "2-3 months" },
];

const educationOptions = [
  { value: "", label: "Select Education" },
  { value: "Intermediate school", label: "Intermediate school" },
  { value: "Secondary school", label: "Secondary school" },
  { value: "Vocational training", label: "Vocational training" },
  { value: "Diploma", label: "Diploma" },
  { value: "Postgraduate", label: "Postgraduate" },
  { value: "bachelor’s degree or master’s degree", label: "bachelor’s degree or master’s degree" },
  { value: "PHD degree", label: "PHD degree" },
  { value: "Doctor(Physicians)", label: "Doctor(Physicians)" },
];

const reasonForChangeOptions = [
  { value: "", label: "Select reason for change" },
  { value: "Looking for new challenges", label: "Looking for new challenges" },
  { value: "Improve my financial situations", label: "Improve my financial situations" },
  { value: "Looking to work with international company", label: "Looking to work with international company" },
  { value: "Looking to work with better environmental work", label: "Looking to work with better environmental work" },
  { value: "Looking to work with better management", label: "Looking to work with better management" },
];

const genderOptions = [
  { value: "", label: "Select Gender" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const maritalStatusOptions = [
  { value: "", label: "Select Marital Status" },
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" },
];

const visa_status = [
  { value: "", label: "Select Visa Type" },
  { value: "residence visa", label: "residence visa" },
  { value: "work visa", label: "work visa" },
  { value: "family visa", label: "family visa" },
  { value: "visit visa", label: "visit visa" },
  { value: "Other", label: "Other" },
];

const experienceOptions = [
  { value: "", label: "Select Experience" },
  { value: "Entry level", label: "Entry level" },
  { value: "Mid-Senior level", label: "Mid-Senior level" },
  { value: "Executive", label: "Executive" },
  { value: "Internship", label: "Internship" },
  { value: "Associate", label: "Associate" },
  { value: "Director", label: "Director" },
];

const skillOptions = [
  { value: "Fast learner", label: "Fast learner" },
  { value: "Team player", label: "Team player" },
  { value: "Time management", label: "Time management" },
  { value: "Work with multi-cultural environment", label: "Work with multi-cultural environment" },
  { value: "Ability to build relationships", label: "Ability to build relationships" },
  { value: "Hard Worker", label: "Hard Worker" },
];

const workTypeOptions = [
  { value: '', label: 'All Work Types' },
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];
export const JobSeekerProfile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [countryCode, setCountryCode] = useState('+971');
  const [isPhoneFromRegistration, setIsPhoneFromRegistration] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(true);
  const [profile, setProfile] = useState<any>({
    firstName: "",
    lastName: "",
    personalEmail: "",
    phone: "",
    nationality: "",
    dob: "",
    age: null,
    gender: "",
    maritalStatus: "",
    dependents: 0,
    totalExperience: 0,
    industries: [],
    currentPosition: "",
    summary: "",
    experience: "",
    currentEmployerExperience: 0,
    currentCompensation: { amount: 0, currency: "USD" },
    expectedCompensation: { amount: 0, currency: "USD" },
    noticePeriod: "",
    reasonForChange: "",
    availability: "Immediately",
    education: "",
    skills: "",
    location: "",
    visaStatus: "",
    portfolioUrl: "",
    linkedinUrl: "",
    qidNo: "",
    passportNo: "",
    profilePic: "",
    resumeUrl: "",
    careerHistory: [
      { company: "", title: "", position: "", location: "", from_date: "", to_date: "", currentlyWorking: false },
    ],
  });

  const countryCodeOptions = allCountries.map((country) => ({
    value: `+${country.dialCode}`,
    label: `${country.name} (+${country.dialCode})`,
  }));

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [savingInterests, setSavingInterests] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchUserInterests();
  }, []);

  const fetchUserInterests = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.interests) {
        setUserInterests(Array.isArray(response.data.interests) ? response.data.interests : []);
      }
    } catch (error) {
      console.error('Failed to fetch user interests:', error);
    }
  };

  const handleSaveInterests = async () => {
    if (userInterests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }

    setSavingInterests(true);
    try {
      await api.patch('/auth/update-interests', { interests: userInterests });
      toast.success('Interests updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update interests');
    } finally {
      setSavingInterests(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/profiles/job-seeker/me");
      if (data.profile) {
        setIsNewProfile(false);
        const p = data.profile;

        const fetchedPhone = p.phone?.toString().trim() ?? "";
        let fetchedCountryCode = '+971'; // Default
        let justPhoneNumber = "";

        if (fetchedPhone.startsWith('+')) {
          const firstSpaceIndex = fetchedPhone.indexOf(' ');
          if (firstSpaceIndex > -1) {
            fetchedCountryCode = fetchedPhone.substring(0, firstSpaceIndex);
            justPhoneNumber = fetchedPhone.substring(firstSpaceIndex + 1);
          } else {
            const sortedCountries = [...allCountries].sort((a, b) => b.dialCode.length - a.dialCode.length);
            const foundCountry = sortedCountries.find(country => fetchedPhone.startsWith(`+${country.dialCode}`));

            if (foundCountry) {
              const codeWithPlus = `+${foundCountry.dialCode}`;
              fetchedCountryCode = codeWithPlus;
              justPhoneNumber = fetchedPhone.substring(codeWithPlus.length).trim();
            } else {
              justPhoneNumber = fetchedPhone;
            }
          }
        } else {
          justPhoneNumber = fetchedPhone;
        }

        setCountryCode(fetchedCountryCode);

        setProfile({

          firstName: p.firstName ?? p.first_name ?? "",
          lastName: p.lastName ?? p.last_name ?? "",
          personalEmail: p.personalEmail ?? p.personal_email ?? "",
          phone: justPhoneNumber,
          nationality: p.nationality?.trim() ?? "",
          dob: p.dob ? p.dob.split("T")[0] : "",
          age: p.age ?? null,
          gender: p.gender?.trim() ?? "",
          maritalStatus: p.maritalStatus ?? p.marital_status ?? "",
          dependents: p.dependents ?? 0,
          totalExperience: p.totalExperience ?? p.total_experience ?? 0,
          industries: p.industries ?? [],
          currentPosition: p.currentPosition ?? p.current_position ?? "",
          summary: p.summary ?? "",
          experience: p.experience ?? "",
          currentEmployerExperience: p.currentEmployerExperience ?? p.current_employer_experience ?? 0,
          currentCompensation: p.currentCompensation ?? p.current_compensation ?? { amount: 0, currency: "USD" },
          expectedCompensation: p.expectedCompensation ?? p.expected_compensation ?? { amount: 0, currency: "USD" },
          noticePeriod: p.noticePeriod ?? p.notice_period ?? "",
          reasonForChange: p.reasonForChange ?? p.reason_for_change ?? "",
          availability: p.availability ?? "",
          visaType: p.visaType ?? p.visa_type ?? "",
          education: p.education ?? "",
          skills: p.skills ?? "",
          location: p.location ?? "",
          visaStatus: p.visaStatus ?? p.visa_status ?? "",
          portfolioUrl: p.portfolioUrl ?? p.portfolio_url ?? "",
          linkedinUrl: p.linkedinUrl ?? p.linkedin_url ?? "",
          qidNo: p.qidNo ?? p.qid_no ?? "",
          passportNo: p.passportNo ?? p.passport_no ?? "",
          profilePic: p.avatar ?? p.profile_pic ?? "",
          resumeUrl: p.resumeUrl ?? (p.resume_url ? `${process.env.NEXT_PUBLIC_API_URL}${p.resume_url}` : ""),
          careerHistory: p.careerHistory?.map((c: any) => ({
            id: c.id, // keep backend ID
            company: c.company,
            title: c.title,
            position: c.position,
            location: c.location ?? "",
            from_date: c.from_date ? new Date(c.from_date).toISOString().slice(0, 7) : "",
            to_date: c.to_date ? new Date(c.to_date).toISOString().slice(0, 7) : "",
            currentlyWorking: c.currently_working,
          })) || [],
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCompensationChange = (
    field: "currentCompensation" | "expectedCompensation",
    key: "currency" | "amount",
    value: string
  ) => {
    setProfile((prev: any) => ({
      ...prev,
      [field]: { ...prev[field], [key]: value },
    }));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/gif"].includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or GIF file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }
    setProfilePicFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfile((prev: any) => ({ ...prev, profilePic: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !["application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(file.type)
    ) {
      toast.error("Please upload a PDF, DOC, or DOCX file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    setResumeFile(file);
  };

  // Career history handlers
  const handleCareerChange = (index: number, field: string, value: any) => {
    const updatedCareer = [...profile.careerHistory];
    if (field === "from_date" || field === "to_date") {
      // Ensure date is in YYYY-MM format
      updatedCareer[index][field] = value; // Value from <input type="month"> is already YYYY-MM
    } else {
      updatedCareer[index][field] = value;
    }
    setProfile((prev: any) => ({ ...prev, careerHistory: updatedCareer }));
  };
  const addCareerEntry = () => {
    setProfile((prev: any) => ({
      ...prev,
      careerHistory: [...prev.careerHistory, { company: "", title: "", position: "", location: "", from_date: "", to_date: "", currentlyWorking: false }],
    }));
  };

  const removeCareerEntry = (index: number) => {
    const updatedCareer = [...profile.careerHistory];
    updatedCareer.splice(index, 1);
    setProfile((prev: any) => ({ ...prev, careerHistory: updatedCareer }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();

      // Normalize career history to match backend
      const normalizedCareer = profile.careerHistory.map((c) => ({
        ...c,
        currently_working: c.currentlyWorking,
        from_date: c.from_date ? new Date(c.from_date).toISOString() : null,
        to_date: c.to_date && !c.currentlyWorking ? new Date(c.to_date).toISOString() : null,
        location: c.location || "N/A", // fallback if empty
      }));

      const profileData = { ...profile };
      profileData.phone = `${countryCode} ${profile.phone.replace(/^0+/, '')}`.trim();

      Object.entries(profileData).forEach(([key, value]) => {
        if (["skills", "industries", "currentCompensation", "expectedCompensation"].includes(key)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === "careerHistory") {
          formData.append("careerHistory", JSON.stringify(normalizedCareer));
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      if (resumeFile) formData.append("resume", resumeFile);
      if (profilePicFile) formData.append("avatar", profilePicFile);

      await api.post("/profiles/job-seeker", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  const isLastCareerCurrentlyWorking = profile.careerHistory.length
    ? profile.careerHistory[profile.careerHistory.length - 1].currentlyWorking
    : false;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">My Profile</h1>

      {/* Job Interests Section */}
      <Card className="mb-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Interests</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select the industries you're interested in to receive email notifications about relevant job postings.
            </p>
            <MultiSelect
              label="Interests"
              options={industryOptions}
              value={userInterests}
              onChange={setUserInterests}
              placeholder="Select industries you're interested in..."
              maxHeight="250px"
            />
            <div className="mt-4">
              <Button
                variant="blue"
                type="button"
                onClick={handleSaveInterests}
                disabled={savingInterests || userInterests.length === 0}
              >
                {savingInterests ? 'Saving...' : 'Save Interests'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                {profile.profilePic ? (
                  <img src={profile.profilePic} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <div>
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#1292bf] hover:text-[#1292bf]/80">
                  <span>Upload a photo</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleProfilePicChange}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 2MB</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" value={profile.firstName} onChange={handleChange} required className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
            <Input label="Last Name" name="lastName" value={profile.lastName} onChange={handleChange} required className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
            <Input label="Email" name="email" value={user?.email || ""} readOnly className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />

            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <label
                  htmlFor="countryCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Code <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className="w-full rounded-md border border-gray-300 bg-white py-2.5 px-3 text-gray-700 text-sm flex justify-between items-center shadow-sm"
                >
                  <span>{countryCode}</span>
                  <span className="text-gray-400">▾</span>
                </button>
                {open && (
                  <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                    {countryCodeOptions.map((opt: any) => (
                      <li
                        key={opt.value}
                        className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-blue-50"
                        onClick={() => {
                          setCountryCode(opt.value);
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
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                  className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1"
                />
              </div>
            </div>
            <Input label="LinkedIn URL" name="linkedinUrl" value={profile.linkedinUrl} onChange={handleChange} className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
            <Input label="Date of Birth" name="dob" type="date" value={profile.dob} onChange={handleChange} required className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
            <Select label="Gender" name="gender" options={genderOptions} value={profile.gender} onChange={handleChange} required className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
            <Select label="Marital Status" name="maritalStatus" options={maritalStatusOptions} value={profile.maritalStatus} onChange={handleChange} required className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
            <Select label="Nationality" name="nationality" options={countryOptions} value={profile.nationality} onChange={handleChange} required className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
            {/* <Input label="QID Number" name="qidNo" value={profile.qidNo} onChange={handleChange} />
            <Input label="Passport Number" name="passportNo" value={profile.passportNo} onChange={handleChange} /> */}
          </div>

          {/* Experience & Compensation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Education Level" name="education" options={educationOptions} value={profile.education} onChange={handleChange} required className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
            <Select label="Experience Level" name="experience" options={experienceOptions} value={profile.experience} onChange={handleChange} required className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
            <Input label="Total Experience (years)" name="totalExperience" type="number" value={profile.totalExperience} onChange={handleChange} required className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
            {/* <Input label="Current Employer Experience (years)" name="currentEmployerExperience" type="number" value={profile.currentEmployerExperience} onChange={handleChange} /> */}
            <Input label="Current Compensation Amount" value={profile.currentCompensation.amount} onChange={(e) => handleCompensationChange("currentCompensation", "amount", e.target.value)} required className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
            <Input label="Expected Compensation Amount" value={profile.expectedCompensation.amount} onChange={(e) => handleCompensationChange("expectedCompensation", "amount", e.target.value)} required className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
            <Select label="Current Position" name="currentPosition" options={currentPositionOptions} value={profile.currentPosition} onChange={handleChange} required className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
            <Input label="Dependents" name="dependents" type="number" value={profile.dependents} onChange={handleChange} className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
          </div>

          <Input label="Reason for Change" name="reasonForChange" value={profile.reasonForChange} onChange={handleChange} className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
          <Select label="Visa Type" name="visaStatus" options={visa_status} value={profile.visaStatus} onChange={handleChange} required className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
          <Select label="Availability" name="availability" options={availabilityOptions} value={profile.availability} onChange={handleChange} required className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
          <Input label="Location" name="location" value={profile.location} onChange={handleChange} required className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />
          <Select label="Industries" name="industries" options={industryOptions} value={profile.industries} onChange={(e: any) => setProfile({ ...profile, industries: Array.from(e.target.selectedOptions, (o: any) => o.value) })} required />
          {/* <Select label="Skills" name="skills" options={skillOptions} value={profile.skills} onChange={(e: any) => setProfile({ ...profile, skills: Array.from(e.target.selectedOptions, (o: any) => o.value) })}  /> */}
          <Input label="Skills" name="skills" value={profile.skills} onChange={handleChange} className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1" />

          {/* Career History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Career History</h3>

            {profile.careerHistory.map((entry: any, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-end border-b pb-4">
                <Input
                  label="Company Name"
                  value={entry.company}
                  onChange={(e) => handleCareerChange(index, "company", e.target.value)}
                  required
                  className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1"
                />
                <Input
                  label="Position"
                  value={entry.position}
                  onChange={(e) => handleCareerChange(index, "position", e.target.value)}
                  required
                  className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1"
                />
                <Select
                  label="Work Type"
                  options={workTypeOptions}
                  value={entry.title}
                  onChange={(e) => handleCareerChange(index, "title", e.target.value)}
                  required
                  className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1"
                />
                <Input
                  label="Location"
                  value={entry.location}
                  onChange={(e) => handleCareerChange(index, "location", e.target.value)}
                  required
                  className="focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1"
                />

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="month"
                    value={entry.from_date || ""}
                    onChange={(e) => handleCareerChange(index, "from_date", e.target.value)}
                    className="border border-gray-300 rounded-md p-2 focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">To</label>
                  {entry.currentlyWorking ? (
                    <span className="p-2 text-gray-900 font-medium">Present</span>
                  ) : (
                    <input
                      type="month"
                      value={entry.to_date || ""}
                      onChange={(e) => handleCareerChange(index, "to_date", e.target.value)}
                      className="border border-gray-300 rounded-md p-2 focus:ring-[#1b3c53] focus:ring-1 focus:ring-offset-1"
                      required
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 col-span-1 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={entry.currentlyWorking || false}
                    onChange={(e) => handleCareerChange(index, "currentlyWorking", e.target.checked)}
                  />
                  <label className="text-sm text-gray-700">I am currently working here</label>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Button type="button" onClick={() => removeCareerEntry(index)} className="bg-red-500 hover:bg-red-600">
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            {/* Conditionally render Add Career Entry */}
            {!isLastCareerCurrentlyWorking && (
              <Button type="button" onClick={addCareerEntry} className="mt-2">
                Add Career Entry
              </Button>
            )}
          </div>


          {/* Resume Upload */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume (PDF, DOC, DOCX)<span className="text-red-500">*</span>
              </label>
              {profile.resumeUrl && !resumeFile && (
                <div className="flex justify-end mt-3">
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg bg-[#1292bf] text-white hover:bg-[#1292bf]/80 focus:ring-[#1292bf] px-4 py-2 flex items-center"
                  >
                    View Current Resume
                  </a>
                </div>
              )}
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#1292bf] transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                        required={isNewProfile}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                  {resumeFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {resumeFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button variant="search" type="submit" disabled={loading} className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
};