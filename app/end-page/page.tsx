'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Users, Heart, MessageSquare, Star } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import QRCode from 'qrcode';

// Helper function to get profile image path
const getProfileImagePath = (name: string) => {
  const firstName = name.split(' ')[0].toLowerCase();
  return `/profile/${firstName}.jpeg`;
};

// Profile Image Component with fallback
const ProfileImage = ({
  name,
  size = 'large',
  className = ''
}: {
  name: string;
  size?: 'large' | 'small';
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const sizeClasses = size === 'large'
    ? 'w-32 h-32 text-3xl ring-4'
    : 'w-20 h-20 text-xl ring-2';
  const gradientClasses = size === 'large'
    ? 'from-[#6B2EFF] to-[#00D4FF]'
    : 'from-[#FF5C7A] to-[#FFD24C]';

  if (imageError) {
    return (
      <div className={`${sizeClasses} bg-gradient-to-br ${gradientClasses} rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-white/30 ${className}`}>
        {name.split(' ').map(n => n[0]).join('')}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} rounded-full shadow-lg ring-white/30 overflow-hidden relative ${className}`}>
      <Image
        src={getProfileImagePath(name)}
        alt={`${name} profile`}
        fill
        className="object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

// Feedback Form Component
const FeedbackForm = () => {
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    rating: 0,
    experience: '',
    suggestions: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', feedback);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleRatingClick = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1 }}
      className="mb-12"
    >
      <Card className="backdrop-blur-lg bg-white/70 border-0 shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 mr-2 text-[#6B2EFF]" />
              Share Your TechDOS Experience
            </h3>
            <p className="text-gray-600">
              Help us improve by sharing your feedback about the TechDOS game experience
            </p>
          </div>

          {isSubmitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-green-600 mb-2">Thank You!</h4>
              <p className="text-gray-600">Your feedback has been submitted successfully.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <Input
                    type="text"
                    value={feedback.name}
                    onChange={(e) => setFeedback(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={feedback.email}
                    onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate Your Experience
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className="transition-colors"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= feedback.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How was your experience?
                </label>
                <Textarea
                  value={feedback.experience}
                  onChange={(e) => setFeedback(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Tell us about your experience with TechDOS..."
                  className="w-full h-24"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suggestions for Improvement
                </label>
                <Textarea
                  value={feedback.suggestions}
                  onChange={(e) => setFeedback(prev => ({ ...prev, suggestions: e.target.value }))}
                  placeholder="Any suggestions to make TechDOS even better?"
                  className="w-full h-20"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#6B2EFF] to-[#00D4FF] hover:opacity-90 transition-opacity px-8 py-2"
                >
                  Submit Feedback
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Confetti component
const Confetti = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number; size: number }>>([]);

  useEffect(() => {
    const colors = ['#00D4FF', '#FF5C7A', '#FFD24C', '#6B2EFF', '#4CAF50', '#E91E63'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 5,
      size: Math.random() * 0.5 + 0.5 // Sizes between 0.5 and 1
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: particle.color,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size * 12}px`,
            height: `${particle.size * 12}px`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            y: [0, -100, -200],
            x: [0, particle.id % 2 === 0 ? 50 : -50, 0],
          }}
          transition={{
            duration: 4 + particle.size * 2,
            delay: particle.delay,
            repeat: Infinity,
            repeatDelay: 7,
          }}
        />
      ))}
    </div>
  );
};

// QR Code Modal Component
const QRModal = ({ isOpen, onClose, linkedinUrl, name }: {
  isOpen: boolean;
  onClose: () => void;
  linkedinUrl: string;
  name: string;
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && linkedinUrl) {
      QRCode.toDataURL(linkedinUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0077B5',  // LinkedIn blue color for QR code
          light: '#FFFFFF'
        }
      }).then(setQrCodeUrl);
    }
  }, [isOpen, linkedinUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-white to-blue-50">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-[#0077B5] flex items-center justify-center gap-2">
            <FaLinkedin className="w-5 h-5" />
            Connect with {name}
          </DialogTitle>
          <DialogDescription className="text-center">
            Scan the QR code below to visit {name}&apos;s LinkedIn profile
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 p-4">
          {qrCodeUrl && (
            <motion.div
              className="relative p-4 bg-white rounded-xl shadow-lg"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img
                src={qrCodeUrl}
                alt={`QR code for ${name}'s LinkedIn`}
                className="w-48 h-48 border-2 border-blue-100 rounded-lg"
              />
              <div className="absolute -top-3 -right-3 bg-[#0077B5] p-2 rounded-full shadow-md">
                <FaLinkedin className="w-5 h-5 text-white" />
              </div>
            </motion.div>
          )}
          <p className="text-sm text-gray-600 text-center px-4">
            Connect with {name} to expand your professional network
          </p>
          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => window.open(linkedinUrl, '_blank')}
              className="flex-1 bg-[#0077B5] hover:bg-[#005885] text-white"
            >
              <FaLinkedin className="w-4 h-4 mr-2" />
              Open Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function EndPage() {
  const [selectedQR, setSelectedQR] = useState<{ url: string; name: string } | null>(null);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});

  // Team coordinators with LinkedIn URLs
  const teamCoordinators = [
    {
      name: "Dario George",
      role: "   Technical-Coordinator",
      avatar: "/api/placeholder/60/60",
      linkedinUrl: "https://www.linkedin.com/in/dario-george/"
    },
    {
      name: "Tippu Sahib",
      role: "Non-Technical Coordinator",
      avatar: "/api/placeholder/60/60",
      linkedinUrl: "https://www.linkedin.com/in/tippu-sahib/"
    }
  ];

  // Team members with LinkedIn URLs
  const teamMembers = [
    {
      name: 'Joshna Jojo',
      role: 'Developer',
      linkedinUrl: 'https://www.linkedin.com/in/joshna-jojo/'
    },
    {
      name: 'Angelina Binoy',
      role: 'Designer',
      linkedinUrl: 'https://www.linkedin.com/in/angelina-binoy/'
    },
    {
      name: 'Annlia Jose',
      role: 'Designer',
      linkedinUrl: 'https://www.linkedin.com/in/annlia-jose/'
    },
    {
      name: 'Gokul Shaji',
      role: 'Developer',
      linkedinUrl: 'https://www.linkedin.com/in/gokul-shaji/'
    },
    {
      name: 'Selin Emla',
      role: 'Developer',
      linkedinUrl: 'https://www.linkedin.com/in/selin-emla/'
    },
    {
      name: 'Daiji Kuriakose',
      role: 'Developer',
      linkedinUrl: 'https://www.linkedin.com/in/daiji-kuriakose/'
    },
    {
      name: 'Stivance K',
      role: 'Designer',
      linkedinUrl: 'https://www.linkedin.com/in/stivance-k/'
    },
    {
      name: 'Aibin Babu',
      role: 'Designer',
      linkedinUrl: 'https://www.linkedin.com/in/aibin-babu/'
    }
  ];

  // Generate QR codes for all LinkedIn URLs
  useEffect(() => {
    const generateQRCodes = async () => {
      const allPeople = [...teamCoordinators, ...teamMembers];
      const qrCodePromises = allPeople.map(async (person) => {
        const qrCodeUrl = await QRCode.toDataURL(person.linkedinUrl, {
          width: 80,
          margin: 1,
          color: {
            dark: '#0077B5',
            light: '#FFFFFF'
          }
        });
        return { [person.linkedinUrl]: qrCodeUrl };
      });

      const qrCodeResults = await Promise.all(qrCodePromises);
      const qrCodeMap = qrCodeResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setQrCodes(qrCodeMap);
    };

    generateQRCodes();
  }, []);

  const handleQRClick = (linkedinUrl: string, name: string) => {
    setSelectedQR({ url: linkedinUrl, name });
  };

  return (
    <>
      <Confetti />
      <div className="min-h-screen bg-gradient-to-br from-[#00D4FF]/10 via-[#FF5C7A]/10 to-[#6B2EFF]/10 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#FFD24C]/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-[#FF5C7A]/20 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-[#00D4FF]/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-[#6B2EFF]/20 rounded-full blur-xl animate-float" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-20">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-[#00D4FF] via-[#FF5C7A] to-[#6B2EFF] bg-clip-text text-transparent leading-tight"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              🎉 Congratulations — You Completed the Game! 🎉
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Thanks for playing. Meet the amazing people who powered TechDOS.
            </motion.p>
            <motion.div 
              className="mt-8 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full shadow-md">
                <p className="text-gray-600 flex items-center">
                  <Sparkles className="w-4 h-4 text-[#FFD24C] mr-2" />
                  <span>Created with passion by the TechDOS team</span>
                  <Sparkles className="w-4 h-4 text-[#FFD24C] ml-2" />
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Main Content - Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column - Faculty Coordinators */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center lg:text-left">
                TechDOS Team
              </h2>

              {/* Team Coordinators */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-[#FFD24C]" />
                  Team Coordinators
                </h3>
                <div className="grid gap-6">
                  {teamCoordinators.map((coordinator, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.1 }}
                    >
                      <Card className="backdrop-blur-lg bg-white/70 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl overflow-hidden relative">
                        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-[#FFD24C] to-[#FF5C7A] text-white border-0 overflow-hidden">
                          <span className="relative z-10">Coordinator</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </Badge>
                        <CardContent className="p-8">
                          <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Profile Photo */}
                            <ProfileImage name={coordinator.name} size="large" />
                            
                            {/* Details */}
                            <div className="flex-1 text-center md:text-left">
                              <h4 className="text-2xl font-bold text-gray-800 mb-2">{coordinator.name}</h4>
                              <p className="text-md text-gray-600 uppercase tracking-wide font-medium mb-4">
                                {coordinator.role}
                              </p>
                              <p className="text-sm text-gray-500 mb-4 max-w-md">
                                Thank you for your leadership and guidance throughout the TechDOS project.
                              </p>
                            </div>

                            {/* QR Code */}
                            <div
                              className="w-24 h-24 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow flex items-center justify-center p-2"
                              onClick={() => handleQRClick(coordinator.linkedinUrl, coordinator.name)}
                            >
                              {qrCodes[coordinator.linkedinUrl] ? (
                                <img
                                  src={qrCodes[coordinator.linkedinUrl]}
                                  alt={`QR code for ${coordinator.name}'s LinkedIn`}
                                  className="w-full h-full object-contain rounded"
                                />
                              ) : (
                                <div className="w-full h-full border border-gray-200 rounded grid place-items-center">
                                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>


            </motion.div>

            {/* Feedback Form Section */}
            <div className="lg:col-span-2">
              <FeedbackForm />
            </div>

            {/* Right Column - TechDOS Team */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              
              {/* Team Members */}
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-[#00D4FF]" />
                  Team Members
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + index * 0.05 }}
                    >
                      <Card className="backdrop-blur-lg bg-white/60 border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-lg overflow-hidden relative">
                        {/* Role Badge */}
                        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-[#00D4FF] to-[#FF5C7A] text-white border-0 overflow-hidden">
                          <span className="relative z-10">{member.role}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </Badge>
                        
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* Profile Photo */}
                            <ProfileImage name={member.name} size="small" />
                            
                            {/* Details */}
                            <div className="flex-1 text-center sm:text-left">
                              <h4 className="text-lg font-bold text-gray-800 mb-1">{member.name}</h4>
                              <p className="text-sm text-gray-600 uppercase tracking-wide font-medium mb-3">
                                {member.role}
                              </p>
                              <p className="text-xs text-gray-500 mb-3 max-w-md">
                                A dedicated team member who contributed to the success of the TechDOS project with creativity and technical expertise.
                              </p>
                            </div>

                            {/* QR Code */}
                            <div
                              className="w-20 h-20 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow transition-shadow flex items-center justify-center p-2"
                              onClick={() => handleQRClick(member.linkedinUrl, member.name)}
                            >
                              {qrCodes[member.linkedinUrl] ? (
                                <img
                                  src={qrCodes[member.linkedinUrl]}
                                  alt={`QR code for ${member.name}'s LinkedIn`}
                                  className="w-full h-full object-contain rounded"
                                />
                              ) : (
                                <div className="w-full h-full border border-gray-200 rounded grid place-items-center">
                                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center"
          >
            <Card className="backdrop-blur-lg bg-white/50 border-0 shadow-lg rounded-2xl max-w-2xl mx-auto">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Thank You for Playing!</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We hope you enjoyed the TechDOS experience. This project was created as part of
                    our commitment to innovative technical learning and community engagement.
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {['Problem Solving', 'Creativity', 'Technical Skills', 'Teamwork', 'Innovation', 'Learning'].map((skill, i) => (
                      <Badge key={i} variant="outline" className="bg-white/50 text-gray-700">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 w-full">
                    <p className="text-xs text-gray-500 flex items-center justify-center">
                      <Heart className="w-3 h-3 mr-1 text-pink-500" />
                      Made with love by the TechDOS team
                      <Heart className="w-3 h-3 ml-1 text-pink-500" />
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.footer>
        </div>
      </div>

      {/* QR Code Modal */}
      {selectedQR && (
        <QRModal
          isOpen={!!selectedQR}
          onClose={() => setSelectedQR(null)}
          linkedinUrl={selectedQR.url}
          name={selectedQR.name}
        />
      )}
    </>
  );
}