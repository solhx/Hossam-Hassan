'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useForm } from 'react-hook-form';
import emailjs from '@emailjs/browser';
import {
  Send,
  CheckCircle,
  AlertCircle,
  MapPin,
  Mail,
  Clock,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BackgroundBeams } from '@/components/ui/background-beams';
import {
  contactSchema,
  type ContactFormData,
} from '@/validation/contact-us-schema';
import { siteConfig, socialLinks } from '@/lib/portfolio-data';
import { cn } from '@/utils/utils';

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_xxxxx';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_xxxxx';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'xxxxx';

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

export function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [status, setStatus] = useState<FormStatus>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  const onSubmit = async (data: ContactFormData) => {
    const result = contactSchema.safeParse(data);
    if (!result.success) return;

    setStatus('sending');
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: data.name,
          from_email: data.email,
          subject: data.subject,
          message: data.message,
        },
        EMAILJS_PUBLIC_KEY
      );
      setStatus('success');
      reset();
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const contactInfo = [
    {
      icon: <Mail size={18} />,
      label: 'Email',
      value: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
    },
    { icon: <MapPin size={18} />, label: 'Location', value: siteConfig.location },
    { icon: <Clock size={18} />, label: 'Response Time', value: 'Within 24 hours' },
  ];

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <BackgroundBeams beamCount={5} className="opacity-20 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          badge="Contact"
          title="Let's Work Together"
          subtitle="Have a project in mind? Let's discuss how we can bring your ideas to life."
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left — Info */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
              <h3 className="text-xl dark:text-neutral-50 font-bold text-foreground">
                Get in Touch
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                I&apos;m always excited to work on new projects. Whether
                it&apos;s a full-stack application, a creative frontend, or
                consulting — let&apos;s talk!
              </p>

              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm font-medium text-foreground dark:text-neutral-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-foreground dark:text-neutral-100">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-xs text-neutral-400 mb-3">Find me on</p>
                <div className="flex gap-2">
                  {socialLinks.map((link) => (
                    <motion.a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-all text-xs font-medium"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {link.name}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium dark:text-neutral-100 text-foreground mb-1.5"
                  >
                    Name
                  </label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    {...register('name', {
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Min 2 characters' },
                    })}
                    className={cn(errors.name && 'border-red-500')}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium dark:text-neutral-100 text-foreground mb-1.5"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email',
                      },
                    })}
                    className={cn(errors.email && 'border-red-500')}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium dark:text-neutral-100 text-foreground mb-1.5"
                >
                  Subject
                </label>
                <Input
                  id="subject"
                  placeholder="Project discussion"
                  {...register('subject', {
                    required: 'Subject is required',
                    minLength: { value: 5, message: 'Min 5 characters' },
                  })}
                  className={cn(errors.subject && 'border-red-500')}
                />
                {errors.subject && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium dark:text-neutral-100 text-foreground mb-1.5"
                >
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell me about your project..."
                  rows={5}
                  {...register('message', {
                    required: 'Message is required',
                    minLength: { value: 10, message: 'Min 10 characters' },
                  })}
                  className={cn(errors.message && 'border-red-500')}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="glow"
                size="lg"
                className="w-full"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Sending...
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle size={18} />
                    Message Sent!
                  </>
                ) : status === 'error' ? (
                  <>
                    <AlertCircle size={18} />
                    Failed — Try Again
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </Button>

              {status === 'success' && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-emerald-600 dark:text-emerald-400 text-center"
                >
                  Thanks! I&apos;ll get back to you within 24 hours.
                </motion.p>
              )}
              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 text-center"
                >
                  Something went wrong. Please try again or email me directly.
                </motion.p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}