"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SchoolDto, SchoolImageContentDto } from "@/services/schoolService/schoolService.types";

const DEFAULT_SHORT_DESCRIPTION =
  "The mission of the student shuttle service is to provide safe, reliable, and comfortable transportation for students every day. Our top priority is protecting each child's safety from the moment they step onto the bus until they arrive at school or home. We are committed to strict safety standards, well-trained drivers, and modern vehicles equipped with essential safety features.";

const DEFAULT_FULL_DESCRIPTION =
  "The student shuttle service is equipped with modern features such as real-time GPS tracking and automatic check-in and check-out for every ride. With GPS, parents and schools can easily monitor the bus's location, ensuring timely and safe transportation. The check-in and check-out system records when each child gets on and off the bus, giving parents instant updates and peace of mind. These smart tools not only enhance safety but also create a transparent, reliable, and trustworthy service for families and schools.";

const DEFAULT_FOOTER_TEXT = "Keeping your child safe is our mission";

const DEFAULT_HIGHLIGHTS = [
  { label: "Real-time alerts", value: "Stay on top of every trip" },
  { label: "Friendly, trained drivers", value: "Professional & caring team" },
  { label: "24/7 support team", value: "Always here for parents" },
  { label: "UI-Friendly with parent", value: "Designed for busy families" },
];

const buildImageSrc = (image?: SchoolImageContentDto, fallback = "/images/bus1.jpg") => {
  if (!image) return fallback;

  if (image.base64Data) {
    const contentType = image.contentType?.trim() || "image/png";
    return `data:${contentType};base64,${image.base64Data}`;
  }

  if (image.fileId) {
    return `/api/file/${image.fileId}`;
  }

  return fallback;
};

interface LandingViewProps {
  school: SchoolDto | null;
  isLoadingSchool?: boolean;
  loadError?: string | null;
  onStartClick?: () => void;
  previewMode?: boolean;
  embedded?: boolean;
}

const LandingView: React.FC<LandingViewProps> = ({
  school,
  isLoadingSchool = false,
  loadError,
  onStartClick,
  previewMode = false,
  embedded = false,
}) => {
  const schoolName = school?.schoolName?.trim() || "EduBus";
  const heroDescription = school?.shortDescription?.trim() || DEFAULT_SHORT_DESCRIPTION;
  const featureDescription = school?.fullDescription?.trim() || DEFAULT_FULL_DESCRIPTION;
  const footerText = school?.footerText?.trim() || DEFAULT_FOOTER_TEXT;
  const slogan = school?.slogan?.trim();

  const logoImageSrc = useMemo(() => {
    if (school?.logoImageBase64) {
      const contentType = school.logoImageContentType?.trim() || "image/png";
      return `data:${contentType};base64,${school.logoImageBase64}`;
    }
    return "/edubus_logo.png";
  }, [school?.logoImageBase64, school?.logoImageContentType]);

  const logoIsDataUrl = logoImageSrc.startsWith("data:");

  const heroImageSrc = useMemo(
    () => buildImageSrc(school?.bannerImage, "/images/bus1.jpg"),
    [school?.bannerImage?.fileId, school?.bannerImage?.base64Data, school?.bannerImage?.contentType]
  );
  const stayConnectedImageSrc = useMemo(
    () => buildImageSrc(school?.stayConnectedImage, "/images/bus2.jpg"),
    [
      school?.stayConnectedImage?.fileId,
      school?.stayConnectedImage?.base64Data,
      school?.stayConnectedImage?.contentType,
    ]
  );
  const featureImageSrc = useMemo(
    () => buildImageSrc(school?.featureImage, "/images/bus3.webp"),
    [school?.featureImage?.fileId, school?.featureImage?.base64Data, school?.featureImage?.contentType]
  );

  const heroImageIsDataUrl = heroImageSrc.startsWith("data:");
  const stayConnectedImageIsDataUrl = stayConnectedImageSrc.startsWith("data:");
  const featureImageIsDataUrl = featureImageSrc.startsWith("data:");

  const highlightItems = useMemo(() => {
    const items: { label: string; value: string }[] = [];

    if (school?.displayAddress || school?.fullAddress) {
      items.push({
        label: "Address",
        value: school.displayAddress || school.fullAddress || "",
      });
    }

    if (school?.phoneNumber) {
      items.push({ label: "Hotline", value: school.phoneNumber });
    }

    if (school?.email) {
      items.push({ label: "Email", value: school.email });
    }

    if (school?.website) {
      items.push({ label: "Website", value: school.website });
    }

    return items.length ? items : DEFAULT_HIGHLIGHTS;
  }, [school]);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const startButtonEnabled = Boolean(onStartClick);
  return (
    <div className={`bg-white ${embedded ? "" : "min-h-screen"}`}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-between px-6 py-4 bg-[#FEFCE8] shadow-soft"
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center space-x-3"
        >
          <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }}>
            <Image
              src={logoImageSrc}
              alt={`${schoolName} Logo`}
              width={60}
              height={60}
              className="drop-shadow-lg object-contain w-14 h-14"
              unoptimized={logoIsDataUrl}
            />
          </motion.div>
          <div>
            <p className="text-sm text-gray-500">Welcome to</p>
            <h1 className="text-2xl font-bold text-[#1F1F1F]">{schoolName}</h1>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-end text-sm md:items-center"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-[999px] px-6 py-3 text-sm font-bold text-black bg-[#FDC700] shadow-[0_10px_25px_rgba(253,199,0,0.35)] hover:brightness-95 hover:shadow-[0_12px_28px_rgba(253,199,0,0.45)] transition-all duration-200 hover:scale-105"
          >
            Login
          </Link>
        </motion.div>
      </motion.header>

      {/* Hero section */}
      <section className="px-6 py-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              <motion.span
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-[#FFF6D8] text-[#D08700] font-medium"
              >
                Safe rides, every day
              </motion.span>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-4"
              >
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
                >
                  Modern school bus service for{" "}
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#D08700]">
                    {schoolName}
                  </motion.span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-lg text-gray-600 leading-relaxed max-w-2xl"
                >
                  {heroDescription}
                </motion.p>
              </motion.div>
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={startButtonEnabled ? { scale: 1.05, y: -2 } : undefined}
                whileTap={startButtonEnabled ? { scale: 0.95 } : undefined}
                onClick={onStartClick}
                disabled={!startButtonEnabled}
                aria-disabled={!startButtonEnabled}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-300 ${
                  startButtonEnabled
                    ? "bg-[#FDC700] text-black hover:shadow-xl"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {previewMode && !startButtonEnabled ? "Preview button" : "Get Started"}
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="bg-[#FEFCE8] rounded-3xl p-8 shadow-soft-lg"
              >
                <Image
                  src={heroImageSrc}
                  alt="School Bus"
                  width={500}
                  height={400}
                  className="w-full h-auto rounded-2xl shadow-lg object-cover"
                  unoptimized={heroImageIsDataUrl}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center space-x-2 mt-6"
              >
                {[0, 1, 2].map((dot) => (
                  <motion.div
                    key={dot}
                    whileHover={{ scale: 1.2 }}
                    className={`w-3 h-3 rounded-full cursor-pointer ${
                      dot === 0 ? "bg-[#D08700]" : "bg-[#FDC700]"
                    }`}
                  ></motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="px-6 py-16 bg-[#FEFCE8]">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center text-gray-800 mb-12"
          >
            Why Parents Should choose {schoolName}
          </motion.h2>
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, amount: 0.3 }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { title: "Easy Registration", desc: "Sign up in minutes" },
              { title: "Live GPS Tracking", desc: "See your child's journey" },
              { title: "Safety First", desc: "Verified drivers & instant alerts" },
              { title: "Parent Community", desc: "Stay connected with others" },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-3xl p-6 shadow-soft-lg hover:shadow-xl transition-all duration-300"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-[#FDC700] rounded-2xl flex items-center justify-center mb-4"
                >
                  <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stay Connected */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="bg-[#FEFCE8] rounded-3xl p-8 shadow-soft-lg"
              >
                <Image
                  src={stayConnectedImageSrc}
                  alt="Children with Bus"
                  width={500}
                  height={400}
                  className="w-full h-auto rounded-2xl shadow-lg object-cover"
                  unoptimized={stayConnectedImageIsDataUrl}
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="bg-[#FDC700] rounded-3xl p-8 text-black shadow-soft-lg"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-center space-x-3 mb-6"
                >
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }}>
                    <Image
                      src={logoImageSrc}
                      alt={`${schoolName} Logo`}
                      width={50}
                      height={50}
                      className="drop-shadow-lg object-contain w-12 h-12"
                      unoptimized={logoIsDataUrl}
                    />
                  </motion.div>
                  <h2 className="text-3xl font-bold">Stay Connected Anytime</h2>
                </motion.div>
                <motion.ul
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: false, amount: 0.3 }}
                  variants={staggerContainer}
                  className="space-y-4 text-lg"
                >
                  {highlightItems.map((item) => (
                    <motion.li key={item.label} variants={fadeInLeft} className="flex items-center space-x-3">
                      <motion.div whileHover={{ scale: 1.5 }} className="w-2 h-2 bg-black rounded-full"></motion.div>
                      <span>
                        <span className="font-semibold">{item.label}:</span> {item.value}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="mt-6 bg-black/10 rounded-2xl p-4"
                >
                  <p className="text-black/80">
                    With {schoolName}, parents receive instant journey updates and peace of mind knowing every ride is
                    closely monitored.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-[#FEFCE8]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-3xl p-8 shadow-soft-lg"
            >
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl font-bold text-gray-800 mb-6"
              >
                Our Feature
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-gray-700 leading-relaxed whitespace-pre-line"
              >
                {featureDescription}
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="bg-[#FEFCE8] rounded-3xl p-8 shadow-soft-lg"
              >
                <Image
                  src={featureImageSrc}
                  alt="Children in Bus"
                  width={500}
                  height={400}
                  className="w-full h-auto rounded-2xl shadow-lg object-cover"
                  unoptimized={featureImageIsDataUrl}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-[#D08700] text-white py-12"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h3
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl font-bold"
          >
            {footerText}
          </motion.h3>
          {isLoadingSchool && <p className="mt-3 text-sm text-white/80">Loading school information...</p>}
          {loadError && <p className="mt-3 text-sm text-white/90">{loadError}</p>}
        </div>
      </motion.footer>

    </div>
  );
};

export default LandingView;


