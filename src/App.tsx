import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft,
  Menu,
  Phone,
  Mail,
  Instagram,
  Facebook,
  X,
  Play,
  MapPin,
  MessageCircle
} from "lucide-react";
import { rooms, Room } from "./data/rooms";
import { galleryMedia, GalleryItem } from "./data/gallery";
import { v4 as uuidv4 } from "uuid";

type Screen = "home" | "selector" | "form" | "success" | "media" | "contact" | "agreement" | "status";

interface Student {
  fullName: string;
  gender: string;
  phone: string;
}

interface FormState {
  students: Student[];
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [previousScreen, setPreviousScreen] = useState<Screen>("home");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [registrationType, setRegistrationType] = useState<string>("");
  const [form, setForm] = useState<FormState>({
    students: [{ fullName: "", gender: "", phone: "" }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);

  // Status Check State
  const [statusInput, setStatusInput] = useState("");
  const [statusResult, setStatusResult] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  const navigateTo = (screen: Screen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    // Reset status fields when leaving
    if (screen !== "status") {
      setStatusInput("");
      setStatusResult(null);
      setStatusError("");
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusInput.trim()) return;

    setStatusLoading(true);
    setStatusError("");
    setStatusResult(null);

    try {
      const response = await fetch(`/api/status/${statusInput.trim()}`);
      const data = await response.json();

      if (data.success) {
        setStatusResult(data.status);
      } else {
        setStatusError(data.error || "Failed to check status. Please try again.");
      }
    } catch (err) {
      setStatusError("A network error occurred. Please try again.");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleBook = (room: Room) => {
    setSelectedRoom(room);
    setCurrentScreen("selector");
  };

  const handleSelectType = (type: string, count: number) => {
    setRegistrationType(type);
    const initialStudents = Array.from({ length: count }, () => ({
      fullName: "",
      gender: "",
      phone: "",
    }));
    setForm({ students: initialStudents });
    setCurrentScreen("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const ref = `FH-${Math.floor(1000 + Math.random() * 9000)}`;
    setReferenceCode(ref);

    // Prepare payload. For multiple students, we join their details or send structured data.
    // The server is currently expecting single fields, so I'll adjust the payload to send joined strings or structured data.
    const payload = {
      registrationType,
      roomTitle: selectedRoom?.title,
      referenceCode: ref,
      // We'll send student details as a single field or separate fields. 
      // Let's send them in a way the server can handle or I'll update the server.
      students: form.students
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentScreen("success");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setCurrentScreen("success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStudent = (index: number, field: keyof Student, value: string) => {
    const newStudents = [...form.students];
    newStudents[index] = { ...newStudents[index], [field]: value };
    setForm({ ...form, students: newStudents });
  };

  const isFormValid = form.students.every(s => s.fullName.trim() !== "" && s.gender !== "" && s.phone.trim() !== "");

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header 
        onLogoClick={() => setCurrentScreen("home")} 
        onGalleryClick={() => navigateTo("media")} 
        onStatusClick={() => navigateTo("status")}
      />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <AnimatePresence mode="wait">
          {currentScreen === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <section className="mb-12">
                <h1 className="text-xl font-bold text-brand-on-surface mb-2">Select your preferred room.</h1>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((room) => (
                  <div key={room.id}>
                    <RoomCard room={room} onBook={() => handleBook(room)} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentScreen === "selector" && (
            <motion.div
              key="selector"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="w-full max-w-2xl">
                <button 
                  onClick={() => setCurrentScreen("home")}
                  className="flex items-center text-brand-secondary hover:text-brand-primary mb-8 cursor-pointer"
                >
                  <ArrowLeft size={20} className="mr-2" /> Back to Rooms
                </button>
                
                <div className="text-center mb-12">
                  <h1 className="text-3xl font-semibold mb-3">Who are you registering for?</h1>
                  <p className="text-brand-secondary">Select how you'll be staying with us.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  <div 
                    onClick={() => handleSelectType("Just Me", 1)}
                    className="registration-card group cursor-pointer"
                  >
                    <User size={64} className="text-brand-primary mb-4" />
                    <span className="text-xl font-semibold group-hover:text-brand-primary">Just Me</span>
                  </div>
                  <div 
                    onClick={() => handleSelectType("We're 2", 2)}
                    className="registration-card group cursor-pointer"
                  >
                    <Users size={64} className="text-brand-primary mb-4" />
                    <span className="text-xl font-semibold group-hover:text-brand-primary">We're 2</span>
                  </div>
                  <div 
                    onClick={() => handleSelectType("We're 3", 3)}
                    className="registration-card group cursor-pointer"
                  >
                    <Users size={64} className="text-brand-primary mb-4" />
                    <span className="text-xl font-semibold group-hover:text-brand-primary">We're 3</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentScreen === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-lg mx-auto py-12"
            >
              <button 
                onClick={() => setCurrentScreen("selector")}
                className="flex items-center text-brand-secondary hover:text-brand-primary mb-8 ml-0 cursor-pointer"
              >
                <ArrowLeft size={20} className="mr-2" /> Back
              </button>

              <div className="bg-white border border-brand-outline rounded-xl p-10 shadow-sm">
                <div className="mb-10">
                  <h1 className="text-3xl font-bold text-brand-primary mb-2">Register</h1>
                  <p className="text-brand-secondary">Please provide your details below to secure your spot.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {form.students.map((student, index) => (
                    <div key={index} className={index > 0 ? "pt-8 border-t border-brand-muted" : ""}>
                      {form.students.length > 1 && (
                        <h3 className="text-sm font-bold text-brand-primary uppercase tracking-widest mb-4">Student {index + 1}</h3>
                      )}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold uppercase tracking-wider text-brand-on-surface">Full Name</label>
                          <input
                            required
                            type="text"
                            className="w-full border border-brand-outline rounded-lg px-4 py-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all bg-brand-surface/30"
                            placeholder="e.g. Jane Doe"
                            value={student.fullName}
                            onChange={(e) => updateStudent(index, "fullName", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold uppercase tracking-wider text-brand-on-surface">Gender</label>
                          <div className="relative">
                            <select
                              required
                              className="w-full border border-brand-outline rounded-lg px-4 py-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all appearance-none bg-brand-surface/30"
                              value={student.gender}
                              onChange={(e) => updateStudent(index, "gender", e.target.value)}
                            >
                              <option value="">Select an option</option>
                              <option value="female">Female</option>
                              <option value="male">Male</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-secondary">
                              <ChevronRight size={20} className="transform rotate-90" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold uppercase tracking-wider text-brand-on-surface">Phone Number</label>
                          <input
                            required
                            type="tel"
                            className="w-full border border-brand-outline rounded-lg px-4 py-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all bg-brand-surface/30"
                            placeholder="+233 24 000 0000"
                            value={student.phone}
                            onChange={(e) => updateStudent(index, "phone", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 space-y-4">
                    <p className="text-sm text-brand-secondary text-center px-4">
                      By clicking "Complete Registration", you agree to our{" "}
                      <button 
                        type="button" 
                        onClick={() => navigateTo("agreement")} 
                        className="text-brand-primary hover:underline font-medium cursor-pointer"
                      >
                        Tenancy Agreement
                      </button>
                      .
                    </p>
                    <button
                      disabled={isSubmitting || !isFormValid}
                      className="w-full bg-brand-primary text-brand-on-primary py-4 rounded-lg font-bold text-lg hover:bg-opacity-95 transition-all disabled:opacity-50 shadow-md shadow-brand-primary/10 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Processing..." : "Complete Registration"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {currentScreen === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-24 h-24 bg-brand-muted rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={48} className="text-brand-primary" />
              </div>
              <h1 className="text-3xl font-semibold mb-3">Registration Received!</h1>
              <p className="text-brand-secondary max-w-sm mb-8">
                Thank you! Your registration is being processed.
              </p>

              <div className="bg-brand-muted w-full max-w-sm p-6 rounded-lg border border-brand-outline mb-10">
                <span className="text-xs uppercase tracking-widest text-brand-secondary font-medium block mb-2">Reference Code</span>
                <span className="text-2xl font-bold font-mono text-brand-on-surface mb-2 block">{referenceCode}</span>
                <p className="text-sm text-brand-secondary mt-4 bg-white p-3 rounded border border-brand-outline text-left">
                  <strong>Important:</strong> Save this code to check your admission status.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setCurrentScreen("home");
                    setForm({ students: [{ fullName: "", gender: "", phone: "" }] });
                  }}
                  className="bg-brand-surface text-brand-on-surface border border-brand-outline px-8 py-3 rounded font-medium hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Back to Rooms
                </button>
                <button
                  onClick={() => {
                    setStatusInput(referenceCode);
                    navigateTo("status");
                  }}
                  className="bg-brand-primary text-brand-on-primary px-8 py-3 rounded font-medium hover:bg-opacity-90 transition-all cursor-pointer"
                >
                  Check Status Now
                </button>
              </div>
            </motion.div>
          )}
          {currentScreen === "media" && (
            <motion.div
              key="media"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <button 
                onClick={() => setCurrentScreen(previousScreen)}
                className="flex items-center text-brand-secondary hover:text-brand-primary mb-8 cursor-pointer"
              >
                <ArrowLeft size={20} className="mr-2" /> Back
              </button>
              <section className="mb-12">
                <h1 className="text-3xl font-semibold mb-3">Hostel Gallery</h1>
                <p className="text-brand-secondary">Explore pictures and videos of our hostel.</p>
              </section>

              {galleryMedia.length === 0 ? (
                <div className="bg-brand-surface-card border border-brand-outline rounded-lg p-12 text-center">
                  <p className="text-brand-secondary">No media items have been added to the gallery yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryMedia.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white border border-brand-outline rounded-lg overflow-hidden flex flex-col group cursor-pointer"
                      onClick={() => setSelectedMedia(item)}
                    >
                      <div className="relative aspect-video overflow-hidden bg-brand-surface">
                        {item.type === "video" ? (
                          <>
                            <video 
                              src={item.url} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                              <div className="bg-black/50 rounded-full p-4 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                                <Play size={32} className="fill-white ml-1" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <img 
                            src={item.url} 
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                      <div className="p-4 border-t border-brand-outline bg-brand-surface-card">
                        <h3 className="font-semibold text-brand-on-surface">{item.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {currentScreen === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto py-12"
            >
              <button 
                onClick={() => setCurrentScreen(previousScreen)}
                className="flex items-center text-brand-secondary hover:text-brand-primary mb-8 cursor-pointer -mt-4"
              >
                <ArrowLeft size={20} className="mr-2" /> Back
              </button>
              <section className="mb-12 text-center">
                <h1 className="text-3xl font-semibold mb-3">Contact Us</h1>
                <p className="text-brand-secondary">Get in touch with us for any inquiries.</p>
              </section>

              <div className="bg-white border border-brand-outline rounded-lg p-8 shadow-sm flex flex-col items-center space-y-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-brand-surface rounded-full flex items-center justify-center mb-4">
                    <MapPin size={24} className="text-brand-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Address</h3>
                  <p className="text-brand-secondary">Prof F Boakye Lane,<br/>Ayeduase, KNUST</p>
                </div>
                
                <div className="w-full h-px bg-brand-outline" />

                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-brand-surface rounded-full flex items-center justify-center mb-4">
                    <Phone size={24} className="text-brand-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Phone</h3>
                  <a href="tel:0557337884" className="text-brand-secondary hover:text-brand-primary transition-colors">0557337884</a>
                </div>

                <div className="w-full h-px bg-brand-outline" />

                <div className="flex flex-col items-center text-center">
                  <h3 className="font-semibold text-lg mb-4">WhatsApp</h3>
                  <a target="_blank" rel="noreferrer" href="https://wa.me/233557337884" className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center hover:bg-[#25D366]/20 transition-colors cursor-pointer group mb-2">
                    <MessageCircle size={32} className="text-[#25D366] group-hover:scale-110 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
          {currentScreen === "status" && (
            <motion.div
              key="status"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto py-12"
            >
              <button 
                onClick={() => setCurrentScreen(previousScreen)}
                className="flex items-center text-brand-secondary hover:text-brand-primary mb-8 cursor-pointer -mt-4"
              >
                <ArrowLeft size={20} className="mr-2" /> Back
              </button>
              <section className="mb-8 text-center">
                <h1 className="text-3xl font-semibold mb-3">Admission Status</h1>
                <p className="text-brand-secondary">Enter your reference code to check your admission status.</p>
              </section>

              <div className="bg-white border border-brand-outline rounded-lg p-8 shadow-sm">
                <form onSubmit={handleCheckStatus} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-brand-on-surface mb-2">
                      Reference Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-brand-surface border border-brand-outline rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all font-mono"
                      placeholder="e.g. FH-1234"
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={statusLoading || !statusInput.trim()}
                    className="w-full bg-brand-primary text-brand-on-primary py-3 rounded-lg font-bold hover:bg-opacity-95 transition-all disabled:opacity-50 shadow-md shadow-brand-primary/10 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {statusLoading ? "Checking..." : "Check Status"}
                  </button>
                </form>

                {statusError && (
                  <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md text-center font-medium">
                    {statusError}
                  </div>
                )}

                {statusResult && (
                  <div className="mt-6 p-6 border border-brand-outline rounded-md text-center bg-brand-surface flex flex-col items-center">
                    <h3 className="text-sm text-brand-secondary mb-2 uppercase tracking-wide font-semibold">Current Status</h3>
                    <div className={`px-4 py-2 rounded-full font-bold text-lg inline-flex items-center gap-2
                      ${statusResult.toLowerCase().includes("pending") ? "bg-orange-100 text-orange-800" : 
                        statusResult.toLowerCase().includes("admitted") || statusResult.toLowerCase().includes("approve") ? "bg-green-100 text-green-800" : 
                        statusResult.toLowerCase().includes("cancel") || statusResult.toLowerCase().includes("reject") ? "bg-red-100 text-red-800" : 
                        "bg-gray-100 text-gray-800"}`}
                    >
                      {statusResult}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentScreen === "agreement" && (
            <motion.div
              key="agreement"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto py-12"
            >
              <button 
                onClick={() => setCurrentScreen(previousScreen)}
                className="flex items-center text-brand-secondary hover:text-brand-primary mb-8 cursor-pointer -mt-4"
              >
                <ArrowLeft size={20} className="mr-2" /> Back
              </button>
              <section className="mb-12 text-center">
                <h1 className="text-3xl font-semibold mb-3">Tenancy Agreement</h1>
                <p className="text-brand-secondary">Please review our rules and regulations for occupants.</p>
              </section>

              <div className="bg-white border border-brand-outline rounded-lg p-8 shadow-sm text-brand-secondary text-sm md:text-base leading-relaxed space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-brand-on-surface mb-4 border-b border-brand-outline pb-2">RULES AND REGULATIONS FOR OCCUPANTS</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-brand-on-surface text-lg mb-2">A. Electricity</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Occupants must pay their electricity bills.</li>
                        <li>Agree on bill payment with your roommate to ensure fairness.</li>
                        <li>Turn off all electrical gadgets before leaving the room.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-brand-on-surface text-lg mb-2">B. Cleaning</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Occupants are responsible for cleaning their rooms, balconies, and washrooms.</li>
                        <li>Do not dispose of sanitary pads or diapers in the toilet bowl or cistern.</li>
                        <li>Take care of fixtures and fittings in bathrooms, balconies, and bedrooms.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-brand-on-surface text-lg mb-2">C. Cooking</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Energy-efficient cookers (induction hobs) are provided in each room.</li>
                        <li><strong>Gas cookers and electric stoves are not allowed.</strong></li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-brand-on-surface text-lg mb-2">D. Noise Level</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Keep noise to a minimum to maintain a conducive atmosphere for sleep and study.</li>
                        <li>Loud music and wild parties are not allowed.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-brand-on-surface text-lg mb-2">E. Smoking</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Smoking is strictly prohibited</strong> in and around the hostel compound. Anyone found smoking will be evicted immediately without a refund.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-brand-on-surface text-lg mb-2">F. Perching</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Perching (unauthorized stays) is strictly prohibited.</strong> Violators and their hosts will be evicted without a refund and reported to the Dean of Students.</li>
                        <li>Do not allow visitors to stay overnight without prior approval from the hostel manager. A penalty of <strong>GH 500.00</strong> will be charged for unapproved overnight stay.</li>
                        <li>The hostel management shall not be held liable for any injury, loss, or legal consequences involving unauthorized guests (visitors who stay overnight without prior approval from the hostel manager).</li>
                        <li>Tenants who permit unauthorized guests to stay overnight shall bear full cost for any incidents, damages, or legal consequences involving their unauthorized guests. This includes, but is not limited to, medical emergencies, theft, property damage, or any legal disputes that may arise.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-brand-on-surface text-lg mb-2">G. Security</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>The gate closes at 11:30 pm and reopens at 5:30 am; visitors will not be allowed in during this time.</li>
                        <li>Visitors must leave before 11:30 pm.</li>
                        <li>Plan your schedule accordingly for everyone's safety, as the gate will not be opened at odd hours.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-brand-on-surface text-lg mb-2">H. Maintenance</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Report any faults and maintenance issues to the Hostel Assistants or Management immediately.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-brand-on-surface text-lg mb-2">I. Damages</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Avoid jumping or bumping into beds and chairs to prevent damage.</li>
                        <li>Do not iron on bare beds to avoid damage. Use a thick blanket or ironing board.</li>
                        <li>Do not nail or paint walls without approval to prevent damage.</li>
                      </ul>
                      <p className="mt-4 italic font-semibold text-brand-on-surface">
                        All rooms are subject to inspection for damages. Damages found will be billed to the occupants.
                      </p>
                      <p className="mt-2 italic font-semibold text-brand-on-surface">
                        Violators will pay for damages through notice from the Dean of Students and will be denied future admission.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-brand-on-surface text-lg mb-2">J. Grounds for Expulsion</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Smoking.</li>
                        <li>Perching.</li>
                        <li>Intentional property damage.</li>
                        <li>Verbal abuse towards roommates or other tenants and engaging in physical altercations.</li>
                        <li>Refusal to pay electricity bill.</li>
                      </ul>
                    </div>

                  </div>
                </div>
              </div>
              
              {previousScreen === "form" && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => setCurrentScreen("form")}
                    className="bg-brand-primary text-brand-on-primary px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all cursor-pointer shadow-md shadow-brand-primary/20 flex items-center"
                  >
                    <ArrowLeft size={20} className="mr-2" /> Return to Registration Page
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer 
        onContactClick={() => navigateTo("contact")} 
        onAgreementClick={() => navigateTo("agreement")}
      />

      {/* Media Overlay Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedMedia(null)}
          >
            <button 
              className="fixed top-6 right-6 text-white hover:text-gray-300 transition-colors z-[110] bg-black/40 p-2 rounded-full cursor-pointer backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMedia(null);
              }}
            >
              <X size={32} />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia.type === "video" ? (
                <video 
                  src={selectedMedia.url} 
                  controls 
                  autoPlay
                  className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <img 
                  src={selectedMedia.url} 
                  alt={selectedMedia.title}
                  className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
              )}
              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-white">{selectedMedia.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Header({ onLogoClick, onGalleryClick, onStatusClick }: { onLogoClick: () => void; onGalleryClick: () => void; onStatusClick: () => void }) {
  return (
    <header className="bg-gradient-to-r from-amber-50 via-[#fdf8f0] to-orange-50 border-b border-brand-outline py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center max-w-6xl">
        <button onClick={onLogoClick} className="text-xl font-black text-brand-primary uppercase tracking-widest border-b-2 border-brand-primary pb-0.5 cursor-pointer hover:opacity-80 transition-opacity">
          FREDMAK HOSTEL
        </button>
        <nav className="flex items-center space-x-6 text-sm font-medium text-brand-secondary">
          <button onClick={onStatusClick} className="hover:text-brand-primary transition-colors cursor-pointer flex items-center gap-1 font-semibold text-brand-primary bg-orange-100 px-3 py-1.5 rounded-md">Check Status</button>
          <button onClick={onGalleryClick} className="hover:text-brand-primary transition-colors cursor-pointer">Gallery</button>
        </nav>
      </div>
    </header>
  );
}

function RoomCard({ room, onBook }: { room: Room; onBook: () => void }) {
  return (
    <div className="bg-white border border-brand-outline overflow-hidden flex flex-col group">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={room.image} 
          alt={room.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          {room.tags.map(tag => (
            <span key={tag} className="text-[10px] font-semibold uppercase tracking-wider bg-brand-muted text-brand-secondary px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        <h2 className="text-xl font-semibold mb-2">{room.title}</h2>
        <p className="text-sm text-brand-secondary mb-6 flex-grow">{room.description}</p>
        
        <div className="flex flex-col gap-4 pt-4 border-t border-brand-outline">
          <div className="flex flex-col">
            <span className="text-lg font-medium text-brand-on-surface">GHS {room.price}</span>
            <span className="text-[10px] text-brand-secondary uppercase tracking-wider">/academic year per student</span>
          </div>
          <button 
            onClick={onBook}
            className="w-full bg-brand-primary text-brand-on-primary py-3 rounded-lg text-base font-bold shadow-md shadow-brand-primary/20 hover:bg-opacity-90 hover:shadow-brand-primary/30 transition-all cursor-pointer"
          >
            Book a room
          </button>
        </div>
      </div>
    </div>
  );
}

function Footer({ onContactClick, onAgreementClick }: { onContactClick: () => void; onAgreementClick: () => void }) {
  return (
    <footer className="bg-white border-t border-brand-outline py-8 mt-12 text-brand-secondary">
      <div className="container mx-auto px-4 max-w-6xl text-center">
        <div className="flex justify-center space-x-6 text-sm mb-8">
          <button onClick={onAgreementClick} className="hover:text-brand-primary transition-colors cursor-pointer">Tenancy Agreement</button>
          <button onClick={onContactClick} className="hover:text-brand-primary transition-colors cursor-pointer">Contact</button>
        </div>
        <div className="text-xs border-t border-brand-muted pt-6 flex justify-center">
          <span>© 2026 Fredmak Hostel</span>
        </div>
      </div>
    </footer>
  );
}
