'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Users, Heart, MessageSquare, QrCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import QRCode from 'qrcode';

// Type definitions for person objects
interface Person {
  name: string;
  role: string;
  linkedinUrl?: string;
  image?: string; // optional public path (e.g. "/end-page/dario.jpg") or absolute URL
}

// Helper function to get profile image path
const getProfileImagePath = (name: string) => {
  // Handle special cases for faculty coordinators
  if (name.includes("Chintu Maria Thomas")) {
    return `/end-page/chintu.jpeg`;
  }
  if (name.includes("Renju Renjith")) {
    return `/end-page/renju.jpeg`;
  }

  const firstName = name.split(' ')[0].toLowerCase();
  return `/end-page/${firstName}.jpeg`;
};

// Profile Image Component with fallback
const ProfileImage = ({
  name,
  size = 'large',
  className = '',
  image
}: {
  name: string;
  size?: 'large' | 'small';
  className?: string;
  image?: string;
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

  // Prefer explicit image prop; fallback to name-based public path
  const src = image && image.length > 0 ? image : getProfileImagePath(name);
  const isAbsolute = /^https?:\/\//i.test(src);

  return (
    <div className={`${sizeClasses} rounded-full shadow-lg ring-white/30 overflow-hidden relative ${className}`}>
      {isAbsolute ? (
        // external absolute URL - use standard img to avoid next/image domain config
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${name} profile`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <Image
          src={src}
          alt={`${name} profile`}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};

// QR Code Section Component
const QRCodeSection = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const feedbackFormUrl = 'https://forms.gle/FZ6GDCn6tXChajuAA'; 

  useEffect(() => {
    QRCode.toDataURL(feedbackFormUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#6B2EFF',
        light: '#FFFFFF'
      }
    }).then(setQrCodeUrl);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="mb-12"
    >
      <Card className="backdrop-blur-lg bg-white/70 border-0 shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center">
              <QrCode className="w-6 h-6 mr-2 text-[#6B2EFF]" />
              Share Your Feedback
            </h3>
            <p className="text-gray-600">
              Scan the QR code below to fill out our feedback form and help us improve TechDOS
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            {qrCodeUrl && (
              <motion.div
                className="relative p-4 bg-white rounded-xl shadow-lg"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
              >
                <img
                  src={qrCodeUrl}
                  alt="Feedback form QR code"
                  className="w-48 h-48 border-2 border-purple-100 rounded-lg"
                />
                <div className="absolute -top-3 -right-3 bg-[#6B2EFF] p-2 rounded-full shadow-md">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            )}

            {/* <div className="text-sm text-gray-600 max-w-md">
              <p className="mb-2">
                <strong>How to submit feedback:</strong>
              </p>
              <ol className="text-left space-y-1">
                <li>1. Scan the QR code with your phone camera</li>
                <li>2. Fill out the feedback form</li>
                <li>3. Submit your responses</li>
                <li>4. Help us make TechDOS even better!</li>
              </ol>
            </div> */}

            {/* <Button
              onClick={() => window.open(feedbackFormUrl, '_blank')}
              className="bg-gradient-to-r from-[#6B2EFF] to-[#00D4FF] hover:opacity-90 transition-opacity px-6 py-2"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Feedback Form
            </Button> */}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Faculty/Student Coordinator Card Component (Red theme)
const CoordinatorCard = ({ person, type }: { person: Person; type: 'faculty' | 'student' }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR for any non-empty linkedinUrl (match TeamMemberCard behavior)
    if (person.linkedinUrl) {
      QRCode.toDataURL(person.linkedinUrl, {
        width: 160,
        margin: 1,
        color: {
          dark: '#DC2626', // Red color for coordinators
          light: '#FFFFFF'
        }
      }).then(setQrCodeUrl);
    }
  }, [person.linkedinUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="backdrop-blur-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-row gap-2 justify-between items-center text-center space-y-4">
            {/* Profile Image */}
            <ProfileImage name={person.name} size="large" image={person.image} />

            {/* Details */}
            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-1">{person.name}</h4>
              <p className="text-sm text-red-600 uppercase tracking-wide font-medium mb-2">
                {person.role}
              </p>
              <Badge className="bg-red-500 text-white border-0">
                {type === 'faculty' ? 'Faculty Coordinator' : 'Student Coordinator'}
              </Badge>
            </div>

            {/* LinkedIn Link / QR */}
            {person.linkedinUrl && (
              <div className="flex items-center space-x-3">
                {qrCodeUrl && (
                  <div className="w-40 h-40 bg-white rounded-lg shadow-sm p-2">
                    <img
                      src={qrCodeUrl}
                      alt={`QR code for ${person.name}'s LinkedIn`}
                      className="w-full h-full object-contain rounded"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Team Member Card Component (Blue theme)
const TeamMemberCard = ({ person, index }: { person: Person; index: number }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>(''); 

  useEffect(() => {
    if (person.linkedinUrl) {
      QRCode.toDataURL(person.linkedinUrl, {
        width: 120,
        margin: 1,
        color: {
          dark: '#2563EB', // Blue color for team members
          light: '#FFFFFF'
        }
      }).then(setQrCodeUrl);
    }
  }, [person.linkedinUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
    >
      <Card className="backdrop-blur-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-lg overflow-hidden h-full">
        <CardContent className="p-4">
          <div className="flex flex-row gap-4 justify-between items-center text-center space-y-3">
            {/* Profile Image */}
            <ProfileImage name={person.name} size="small" image={person.image} />

            {/* Details */}
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-1">{person.name}</h4>
              <p className="text-sm text-blue-600 uppercase tracking-wide font-medium mb-2">
                {person.role}
              </p>
              <Badge className="bg-blue-500 text-white border-0 text-xs">
                Team Member
              </Badge>
            </div>

            {/* LinkedIn Link */}
            <div className="flex items-center space-x-2">
              {qrCodeUrl && (
                <div className="w-32 h-32 bg-white rounded-lg shadow-sm p-1">
                  <img
                    src={qrCodeUrl}
                    alt={`QR code for ${person.name}'s LinkedIn`}
                    className="w-full h-full object-contain rounded"
                  />
                </div>
              )}
              {/* <Button
                onClick={() => window.open(person.linkedinUrl, '_blank')}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                size="sm"
              >
                <FaLinkedin className="w-3 h-3 mr-1" />
                LinkedIn
              </Button> */}
            </div>
          </div>
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



export default function EndPage() {

  // Faculty Coordinators
  const facultyCoordinators = [
    {
      name: "Asst Prof Chintu Maria Thomas",
      role: "Professor",
      linkedinUrl: "https://sjcetpalai.ac.in/chintu-cs/",
      image: "/end-page/chintu.jpeg"
    },
    {
      name: "Asst Prof Renju Renjith",
      role: "Professor",
      linkedinUrl: "https://sjcetpalai.ac.in/renju-cs/",
      image: "/end-page/renju.jpeg"
    }
  ];

  // Student Coordinators
  const studentCoordinators = [
    {
      name: "Dario George",
      role: "Senior Developer",
      linkedinUrl: "https://www.linkedin.com/in/dariogeorge21/",
      image: "/end-page/dario.jpg"
    },
    {
      name: "Tippu Sahib",
      role: "Product Manager",
      linkedinUrl: "https://www.linkedin.com/in/s-tippu-sahib-23404833b/",
      image: "/end-page/tippu.jpeg"
    }
  ];

  // Team Members
  const teamMembers = [
    {
      name: 'Joshna Jojo',
      role: 'Designer',
      linkedinUrl: 'https://www.linkedin.com/in/joshna-jojo-9b2806327/',
      image: '/end-page/joshna.jpeg'
    },
    {
      name: 'Daiji Kuriakose',
      role: 'Developer',
      linkedinUrl: 'https://www.linkedin.com/in/daiji-kuriakose/',
      image: '/end-page/daiji.jpeg'
    },
    {
      name: 'Stivance K Baby',
      role: 'Q&A',
      linkedinUrl: 'https://www.linkedin.com/in/stivance-k-baby/',
      image: '/end-page/stivance.jpeg'
    },
    {
      name: 'Annlia Jose',
      role: 'Designer',
      linkedinUrl: 'https://www.linkedin.com/in/annlia-jose-325a8b345/',
      image: '/end-page/annlia.jpg'
    },
    {
      name: 'Gokul Shaji',
      role: 'Developer',
      linkedinUrl: 'https://www.linkedin.com/in/gokul-shaji-848334328/',
      image: '/end-page/gokul.jpg'
    },
    {
      name: 'Aibin Babu',
      role: 'Marketing',
      linkedinUrl: 'https://www.linkedin.com/in/aibin-babu-8982a3328/',
      image: '/end-page/aibin.jpeg'
    },
    {
      name: 'Selin Emla Sunish',
      role: 'Developer',
      linkedinUrl: 'https://www.linkedin.com/in/selin-emla-sunish-a55778322/',
      image: '/end-page/selin.jpg'
    },
    {
      name: 'Angelina Binoy',
      role: 'Designer',
      linkedinUrl: 'https://www.linkedin.com/in/angelina-binoy-983b94315/',
      image: '/end-page/angelina.jpeg'
    },
    {
      name: 'Dijin Leo',
      role: 'UI/UX Designer',
      linkedinUrl: 'https://www.linkedin.com/in/dijin-leo-d-44408431a/',
      image: '/end-page/dijin.jpg'
    }
  ];



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

          {/* QR Code Section */}
          <QRCodeSection />

          {/* TechDOS Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">
              TechDOS Team
            </h2>

            {/* Coordinators Section - Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Faculty Coordinators */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                <h3 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center justify-center lg:justify-start">
                  <Trophy className="w-6 h-6 mr-2 text-red-500" />
                  Faculty Coordinators
                </h3>
                <div className="space-y-6">
                  {facultyCoordinators.map((coordinator, index) => (
                    <CoordinatorCard
                      key={index}
                      person={coordinator}
                      type="faculty"
                    />
                  ))}
                </div>
              </motion.div>

              {/* Student Coordinators */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
              >
                <h3 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center justify-center lg:justify-start">
                  <Trophy className="w-6 h-6 mr-2 text-red-500" />
                  Student Coordinators
                </h3>
                <div className="space-y-6">
                  {studentCoordinators.map((coordinator, index) => (
                    <CoordinatorCard
                      key={index}
                      person={coordinator}
                      type="student"
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Team Members Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
            >
              <h3 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center justify-center">
                <Users className="w-6 h-6 mr-2 text-blue-500" />
                Team Members
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamMembers.map((member, index) => (
                  <TeamMemberCard
                    key={index}
                    person={member}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

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

    </>
  );
}