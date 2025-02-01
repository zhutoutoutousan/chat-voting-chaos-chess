'use client'

import { motion } from 'framer-motion'
import { IconBrandGithub, IconBrandTwitter, IconBrandDiscord } from '@tabler/icons-react'
import { ChaosText } from './ChaosText' // We'll move ChaosText to a separate component

export function ChaoticFooter() {
  return (
    <motion.footer 
      className="relative overflow-hidden py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Chaotic background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, rgba(255,0,0,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, rgba(0,0,255,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 100%, rgba(255,0,255,0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Logo Section */}
          <div className="text-center md:text-left">
            <motion.div
              className="text-3xl font-bold mb-4"
              animate={{ 
                textShadow: [
                  '0 0 10px rgba(255,0,0,0.5)',
                  '0 0 10px rgba(0,0,255,0.5)',
                  '0 0 10px rgba(255,0,255,0.5)',
                ]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <ChaosText text="Chaos Chess" />
            </motion.div>
            <p className="text-white/80 backdrop-blur-sm bg-white/5 rounded-lg p-4">
              Where chaos meets strategy in the ultimate chess experience
            </p>
          </div>

          {/* Links Section */}
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-bold mb-6">
              <ChaosText text="Quick Links" />
            </h3>
            {['Play Now', 'Learn More', 'Rankings', 'About Us'].map((link, i) => (
              <motion.a
                key={link}
                href="#"
                className="block text-white/80 hover:text-white backdrop-blur-sm bg-white/5 rounded-lg p-2 transition-all"
                whileHover={{ scale: 1.05, x: Math.sin(i) * 10 }}
                animate={{
                  y: [0, 5 * Math.sin(i), 0],
                }}
                transition={{ duration: 2 + i, repeat: Infinity }}
              >
                {link}
              </motion.a>
            ))}
          </div>

          {/* Social Links */}
          <div className="text-center md:text-right">
            <h3 className="text-xl font-bold mb-6">
              <ChaosText text="Connect With Us" />
            </h3>
            <div className="flex justify-center md:justify-end gap-4">
              {[
                { icon: IconBrandGithub, color: '#333' },
                { icon: IconBrandTwitter, color: '#1DA1F2' },
                { icon: IconBrandDiscord, color: '#7289DA' },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href="#"
                  className="p-3 backdrop-blur-sm bg-white/10 rounded-full hover:bg-white/20 transition-all"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  animate={{
                    y: [0, 10 * Math.sin(i), 0],
                  }}
                  transition={{ duration: 2 + i, repeat: Infinity }}
                >
                  <social.icon className="w-6 h-6" style={{ color: social.color }} />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <motion.div
          className="text-center mt-12 pt-12 border-t border-white/10"
          animate={{
            color: ['#fff', '#ff0000', '#0000ff', '#fff'],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        >
          <ChaosText text="© 2024 Chaos Chess. All rights reserved." />
        </motion.div>
      </div>
    </motion.footer>
  )
} 