// src/components/sections/home/Contact.tsx
'use client';
import React from 'react';
import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import emailjs from '@emailjs/browser';
import {
  Send,
  CheckCircle,
  AlertCircle,
  MapPin,
  Mail,
  Clock,
} from 'lucide-react';
import { SectionHeading }  from '@/components/ui/section-heading';
import { Button }          from '@/components/ui/button';
import { Input }           from '@/components/ui/input';
import { Textarea }        from '@/components/ui/textarea';
import { BackgroundBeams } from '@/components/ui/background-beams';
import {
  contactSchema,
  type ContactFormData,
} from '@/validation/contact-us-schema';
import { siteConfig, socialLinks } from '@/lib/portfolio-data';
import { cn } from '@/utils/utils';

const EMAILJS_SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

const Contact = React.memo(function Contact() { 
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [status, setStatus] = useState<FormStatus>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    // ✅ Single source of truth — Zod schema drives all validation
    // No inline rules needed on register() calls
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  const onSubmit = async (data: ContactFormData) => {
    // ✅ No safeParse — RHF + zodResolver already validated at this point

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error(
        '[Contact] EmailJS environment variables are not configured',
      );
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
      return;
    }

    setStatus('sending');
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:  data.name,
          from_email: data.email,
          subject:    data.subject,
          message:    data.message,
        },
        EMAILJS_PUBLIC_KEY,
      );
      setStatus('success');
      reset();
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error('[Contact] EmailJS send failed:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const contactInfo = [
    {
      icon:  <Mail   size={18} />,
      label: 'Email',
      value: siteConfig.email,
      href:  `mailto:${siteConfig.email}`,
    },
    {
      icon:  <MapPin size={18} />,
      label: 'Location',
      value: siteConfig.location,
    },
    {
      icon:  <Clock  size={18} />,
      label: 'Response Time',
      value: 'Within 24 hours',
    },
  ];

  return (
    <section
      id="contact"
      ref={ref}
      aria-label="Contact section"
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <BackgroundBeams
          beamCount={5}
          className="opacity-20 pointer-events-none"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          badge="Contact"
          title="Let's Work Together"
          subtitle="Have a project in mind? Let's discuss how we can bring your ideas to life."
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* ── Left — Info ── */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
              <h3 className="text-xl font-bold text-foreground dark:text-neutral-50">
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
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link) => (
                    <motion.a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit Hossam on ${link.name}`}
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

          {/* ── Right — Form ── */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              aria-label="Contact form"
              className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-foreground dark:text-neutral-100 mb-1.5"
                  >
                    Name
                  </label>
                  <Input
                    id="contact-name"
                    placeholder="John Doe"
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    aria-describedby={
                      errors.name ? 'contact-name-error' : undefined
                    }
                    {...register('name')}
                    className={cn(errors.name && 'border-red-500')}
                  />
                  {errors.name && (
                    <p
                      id="contact-name-error"
                      role="alert"
                      className="mt-1 text-xs text-red-500"
                    >
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-foreground dark:text-neutral-100 mb-1.5"
                  >
                    Email
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="john@example.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? 'contact-email-error' : undefined
                    }
                    {...register('email')}
                    className={cn(errors.email && 'border-red-500')}
                  />
                  {errors.email && (
                    <p
                      id="contact-email-error"
                      role="alert"
                      className="mt-1 text-xs text-red-500"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-sm font-medium text-foreground dark:text-neutral-100 mb-1.5"
                >
                  Subject
                </label>
                <Input
                  id="contact-subject"
                  placeholder="Project discussion"
                  aria-invalid={!!errors.subject}
                  aria-describedby={
                    errors.subject ? 'contact-subject-error' : undefined
                  }
                  {...register('subject')}
                  className={cn(errors.subject && 'border-red-500')}
                />
                {errors.subject && (
                  <p
                    id="contact-subject-error"
                    role="alert"
                    className="mt-1 text-xs text-red-500"
                  >
                    {errors.subject.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-foreground dark:text-neutral-100 mb-1.5"
                >
                  Message
                </label>
                <Textarea
                  id="contact-message"
                  placeholder="Tell me about your project..."
                  rows={5}
                  aria-invalid={!!errors.message}
                  aria-describedby={
                    errors.message ? 'contact-message-error' : undefined
                  }
                  {...register('message')}
                  className={cn(errors.message && 'border-red-500')}
                />
                {errors.message && (
                  <p
                    id="contact-message-error"
                    role="alert"
                    className="mt-1 text-xs text-red-500"
                  >
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="glow"
                size="lg"
                className="w-full"
                disabled={status === 'sending' || isSubmitting}
                aria-busy={status === 'sending'}
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
                      aria-hidden="true"
                    />
                    Sending...
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle size={18} aria-hidden="true" />
                    Message Sent!
                  </>
                ) : status === 'error' ? (
                  <>
                    <AlertCircle size={18} aria-hidden="true" />
                    Failed — Try Again
                  </>
                ) : (
                  <>
                    <Send size={18} aria-hidden="true" />
                    Send Message
                  </>
                )}
              </Button>

              {/* Status messages */}
              {status === 'success' && (
                <motion.p
                  role="status"
                  aria-live="polite"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-emerald-600 dark:text-emerald-400 text-center"
                >
                  Thanks! I&apos;ll get back to you within 24 hours.
                </motion.p>
              )}
              {status === 'error' && (
                <motion.p
                  role="alert"
                  aria-live="assertive"
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
});
Contact.displayName = 'Contact';
export { Contact };