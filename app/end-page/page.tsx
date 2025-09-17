'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ExternalLink, Sparkles, Trophy, Users, Heart } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import QRCode from 'qrcode';

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
            Scan the QR code below to visit {name}'s LinkedIn profile
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

  // Team coordinators with LinkedIn URLs
  const teamCoordinators = [
    {
      name: "Dario George",
      role: "Coordinator",
      avatar: "/api/placeholder/60/60",
      linkedinUrl: "https://www.linkedin.com/in/dario-george/"
    },
    {
      name: "Tippu Sahib",
      role: "Coordinator",
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
      role: 'Developer',
      linkedinUrl: 'https://www.linkedin.com/in/annlia-jose/'
    },
    {
      name: 'Gokul Shaji',
      role: 'Developer',
      linkedinUrl: 'https://www.linkedin.com/in/gokul-shaji/'
    },
    {
      name: 'Selin Emla',
      role: 'Designer',
      linkedinUrl: 'https://www.linkedin.com/in/selin-emla/'
    },
    {
      name: 'Daiji Kuriakose',
      role: 'Developer',
      linkedinUrl: 'https://www.linkedin.com/in/daiji-kuriakose/'
    },
    {
      name: 'Alan Biju',
      role: 'Developer',
      linkedinUrl: 'https://www.linkedin.com/in/alan-biju/'
    },
    {
      name: 'Stivance K',
      role: 'Designer',
      linkedinUrl: 'https://www.linkedin.com/in/stivance-k/'
    },
    {
      name: 'Aibin Babu',
      role: 'Developer',
      linkedinUrl: 'https://www.linkedin.com/in/aibin-babu/'
    }
  ];

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
                            <div className="w-32 h-32 bg-gradient-to-br from-[#6B2EFF] to-[#00D4FF] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white/30">
                              {coordinator.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            
                            {/* Details */}
                            <div className="flex-1 text-center md:text-left">
                              <h4 className="text-2xl font-bold text-gray-800 mb-2">{coordinator.name}</h4>
                              <p className="text-md text-gray-600 uppercase tracking-wide font-medium mb-4">
                                {coordinator.role}
                              </p>
                              <p className="text-sm text-gray-500 mb-4 max-w-md">
                                Thank you for your leadership and guidance throughout the TechDOS project.
                              </p>
                              <Button 
                                onClick={() => handleQRClick(coordinator.linkedinUrl, coordinator.name)}
                                className="text-sm bg-gradient-to-r from-[#6B2EFF] to-[#00D4FF] hover:opacity-90 transition-opacity"
                                size="sm"
                              >
                                <FaLinkedin className="w-4 h-4 mr-2" />
                                Connect on LinkedIn
                              </Button>
                            </div>
                            
                            {/* QR Code Preview */}
                            <div 
                              className="w-24 h-24 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow flex flex-col items-center justify-center p-2"
                              onClick={() => handleQRClick(coordinator.linkedinUrl, coordinator.name)}
                            >
                              <div className="w-full h-full border border-gray-200 rounded grid place-items-center">
                                <FaLinkedin className="w-8 h-8 text-[#0077B5]" />
                              </div>
                              <span className="text-[10px] text-gray-500 mt-1">Scan for LinkedIn</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              
            </motion.div>

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
                            <div className="w-20 h-20 bg-gradient-to-br from-[#FF5C7A] to-[#FFD24C] rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md ring-2 ring-white/30">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            
                            {/* Details */}
                            <div className="flex-1 text-center sm:text-left">
                              <h4 className="text-lg font-bold text-gray-800 mb-1">{member.name}</h4>
                              <p className="text-sm text-gray-600 uppercase tracking-wide font-medium mb-3">
                                {member.role}
                              </p>
                              <p className="text-xs text-gray-500 mb-3 max-w-md">
                                A dedicated team member who contributed to the success of the TechDOS project with creativity and technical expertise.
                              </p>
                              <Button 
                                onClick={() => handleQRClick(member.linkedinUrl, member.name)}
                                variant="outline"
                                className="text-sm border-[#FF5C7A]/30 text-[#FF5C7A] hover:bg-[#FF5C7A]/10"
                                size="sm"
                              >
                                <FaLinkedin className="w-4 h-4 mr-2" />
                                Connect on LinkedIn
                              </Button>
                            </div>
                            
                            {/* QR Code Preview */}
                            <div 
                              className="w-20 h-20 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow transition-shadow flex flex-col items-center justify-center p-2"
                              onClick={() => handleQRClick(member.linkedinUrl, member.name)}
                            >
                              <div className="w-full h-full border border-gray-200 rounded grid place-items-center">
                                <FaLinkedin className="w-6 h-6 text-[#0077B5]" />
                              </div>
                              <span className="text-[9px] text-gray-500 mt-1">Scan for LinkedIn</span>
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