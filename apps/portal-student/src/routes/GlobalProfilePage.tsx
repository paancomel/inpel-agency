import { ArrowRight, ImagePlus, MapPin, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { SecureImageUpload } from "../components/SecureImageUpload";
import { ToastNotification } from "../components/ToastNotification";
import { galleryImageSchema, universityProfileSchema } from "../lib/validation";
import { usePortal } from "../state/usePortal";
import { FACILITIES, type FacilityKey, type UniversityProfile } from "../types/portal";

type ProfileErrors = Partial<Record<keyof UniversityProfile, string>>;

interface TextFieldProps {
  error?: string | undefined;
  label: string;
  name: keyof UniversityProfile;
  onChange: (name: keyof UniversityProfile, value: string) => void;
  placeholder?: string | undefined;
  type?: "email" | "text" | "url" | undefined;
  value: string;
}

function TextField({ error, label, name, onChange, placeholder, type = "text", value }: TextFieldProps) {
  const id = `profile-${name}`;
  return <label className="block" htmlFor={id}><span className="field-label">{label}</span><input aria-describedby={error ? `${id}-error` : undefined} aria-invalid={Boolean(error)} className="field-control mt-2 bg-mist/50" id={id} onChange={(event) => onChange(name, event.target.value)} placeholder={placeholder} type={type} value={value} />{error ? <span className="mt-1 block text-xs font-semibold text-rose-700" id={`${id}-error`}>{error}</span> : null}</label>;
}

export function GlobalProfilePage() {
  const {
    addGalleryImage,
    draft,
    pendingAssets,
    removeGalleryImage,
    setFacilityAsset,
    setFacilityEnabled,
    setLogoAsset,
    updateProfile,
  } = usePortal();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [imageCategory, setImageCategory] = useState("Campus");
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<FacilityKey | "">("");
  const selectedFacilityDefinition = FACILITIES.find(({ key }) => key === selectedFacility);

  function handleProfileChange(name: keyof UniversityProfile, value: string) {
    updateProfile({ [name]: value });
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function handleAddImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = galleryImageSchema.safeParse({ id: crypto.randomUUID(), category: imageCategory, previewUrl: imageUrl });
    if (!result.success) {
      setImageError(result.error.issues[0]?.message ?? "Enter a valid image URL.");
      return;
    }
    addGalleryImage(result.data);
    setImageUrl("");
    setImageError(null);
    setToast("Gallery image added to the draft.");
  }

  function handleReview() {
    const result = universityProfileSchema.safeParse(draft.profile);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([key, value]) => [key, value?.[0]])));
      document.getElementById(`profile-${String(result.error.issues[0]?.path[0] ?? "name")}`)?.focus();
      return;
    }
    navigate("/dashboard/review");
  }

  return (
    <div className="mx-auto max-w-6xl">
      {toast ? <ToastNotification message={toast} onDismiss={() => setToast(null)} /> : null}
      <div className="mb-9 max-w-3xl"><p className="eyebrow">Institution identity</p><h2 className="page-title">Build the profile students will trust.</h2><p className="page-intro">Add accurate structural data, contact details, and verified images. Optional blank fields are labelled clearly during review.</p></div>

      <div className="space-y-10">
        <section className="section-card" aria-labelledby="identity-heading">
          <div className="section-heading"><span className="section-number">01</span><div><h3 id="identity-heading">Institution details</h3><p>The primary identity and location shown throughout INPELER.</p></div></div>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField error={errors.name} label="Institution name *" name="name" onChange={handleProfileChange} placeholder="Universiti Contoh Malaysia" value={draft.profile.name} />
            <TextField error={errors.location} label="City / state" name="location" onChange={handleProfileChange} placeholder="Kuala Lumpur" value={draft.profile.location} />
            <label className="block md:col-span-2" htmlFor="profile-address"><span className="field-label">Campus address</span><span className="relative mt-2 block"><MapPin aria-hidden="true" className="absolute left-3.5 top-3.5 text-slate-400" size={18} /><textarea className="field-control min-h-24 bg-mist/50 pl-11" id="profile-address" onChange={(event) => handleProfileChange("address", event.target.value)} placeholder="Full correspondence address" value={draft.profile.address} /></span></label>
            <TextField error={errors.website} label="Official website" name="website" onChange={handleProfileChange} placeholder="https://university.edu.my" type="url" value={draft.profile.website} />
            <div className="md:col-span-2"><SecureImageUpload existingUrl={draft.profile.logoUrl || undefined} file={pendingAssets.logo} id="profile-logoUrl" label="Institution logo" onChange={setLogoAsset} /></div>
          </div>
        </section>

        <section className="section-card" aria-labelledby="contact-heading">
          <div className="section-heading"><span className="section-number">02</span><div><h3 id="contact-heading">Contacts and headline figures</h3><p>Keep these values current for prospective students and families.</p></div></div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <TextField error={errors.contactEmail} label="Contact email" name="contactEmail" onChange={handleProfileChange} placeholder="admissions@university.edu.my" type="email" value={draft.profile.contactEmail} />
            <TextField error={errors.contactPhone} label="Contact phone" name="contactPhone" onChange={handleProfileChange} placeholder="+60 3 1234 5678" value={draft.profile.contactPhone} />
            <TextField error={errors.acceptanceRate} label="Acceptance rate (%)" name="acceptanceRate" onChange={handleProfileChange} placeholder="72" value={draft.profile.acceptanceRate} />
            <TextField error={errors.tuitionFees} label="Typical annual tuition (RM)" name="tuitionFees" onChange={handleProfileChange} placeholder="45000" value={draft.profile.tuitionFees} />
          </div>
        </section>

        <section className="section-card" aria-labelledby="facilities-heading">
          <div className="section-heading"><span className="section-number">03</span><div><h3 id="facilities-heading">Facilities</h3><p>Choose a facility, then attach the image students and families should see.</p></div></div>
          <label className="block max-w-lg" htmlFor="facility-selector"><span className="field-label">Choose a facility</span><select className="field-control mt-2 bg-mist/50" id="facility-selector" onChange={(event) => { const key = event.target.value as FacilityKey | ""; setSelectedFacility(key); if (key) setFacilityEnabled(key, true); }} value={selectedFacility}><option value="">Select a facility</option>{FACILITIES.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}</select></label>
          {selectedFacilityDefinition ? <div className="mt-5 max-w-2xl"><SecureImageUpload existingUrl={draft.facilityImages[selectedFacilityDefinition.key]} file={pendingAssets.facilities[selectedFacilityDefinition.key] ?? null} id={`facility-${selectedFacilityDefinition.key}-image`} label={`${selectedFacilityDefinition.label} image`} onChange={(file) => setFacilityAsset(selectedFacilityDefinition.key, file)} /></div> : <p className="mt-4 text-sm text-slate-500">Select a facility to add its image. Previously selected facilities remain in the publishing draft.</p>}
          {FACILITIES.some(({ key }) => draft.facilities[key]) ? <div className="mt-5 border-t border-frost pt-4"><p className="field-label">Selected facilities</p><ul className="mt-3 flex flex-wrap gap-2">{FACILITIES.filter(({ key }) => draft.facilities[key]).map(({ key, label }) => <li className="bg-mist px-3 py-2 text-xs font-bold text-navy" key={key}>{label}</li>)}</ul></div> : null}
        </section>

        <section className="section-card" aria-labelledby="gallery-heading">
          <div className="section-heading"><span className="section-number">04</span><div><h3 id="gallery-heading">Gallery</h3><p>Add public image URLs for campus life and student spaces.</p></div></div>
          <form className="grid gap-4 border border-dashed border-slate-300 bg-mist/40 p-5 md:grid-cols-[0.7fr_1.6fr_auto] md:items-end" onSubmit={handleAddImage}>
            <label className="block" htmlFor="image-category"><span className="field-label">Category</span><input className="field-control mt-2 bg-white" id="image-category" onChange={(event) => setImageCategory(event.target.value)} value={imageCategory} /></label>
            <label className="block" htmlFor="image-url"><span className="field-label">Image URL</span><input aria-describedby={imageError ? "image-url-error" : undefined} aria-invalid={Boolean(imageError)} className="field-control mt-2 bg-white" id="image-url" onChange={(event) => { setImageUrl(event.target.value); setImageError(null); }} placeholder="https://…/campus.jpg" type="url" value={imageUrl} />{imageError ? <span className="mt-1 block text-xs font-semibold text-rose-700" id="image-url-error">{imageError}</span> : null}</label>
            <button className="secondary-button" type="submit"><ImagePlus aria-hidden="true" size={18} /> Add image</button>
          </form>
          {draft.gallery.length === 0 ? <p className="mt-5 text-sm text-slate-500">No gallery images added yet. This optional section will appear as “Empty” in review.</p> : <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{draft.gallery.map((image) => <li className="overflow-hidden border border-frost bg-white" key={image.id}><img alt={`${image.category} gallery preview`} className="h-36 w-full object-cover" src={image.previewUrl} /><div className="flex items-center justify-between gap-3 p-3"><span className="truncate text-sm font-semibold">{image.category || "Uncategorised"}</span><button aria-label={`Remove ${image.category} image`} className="text-slate-400 hover:text-rose-700" onClick={() => removeGalleryImage(image.id)} type="button"><Trash2 aria-hidden="true" size={17} /></button></div></li>)}</ul>}
        </section>
      </div>

      <div className="mt-8 flex justify-end"><button className="primary-button" onClick={handleReview} type="button">Review Data <ArrowRight aria-hidden="true" size={18} /></button></div>
    </div>
  );
}
