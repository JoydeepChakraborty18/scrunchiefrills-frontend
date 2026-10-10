import { motion } from "framer-motion";

const About = () => {
  const sections = [
    {
      title: "The Heart of the Brand",
      image: "/images/grandma_image.png",
      content: `Scrunchiefrills wasn’t born in a factory; it was born from a memory. My grandmother was a woman of quiet creativity who navigated the world with her own sewing machine. Though that specific machine was gifted away and couldn't be recovered after she passed, her spirit of "making" stayed with me.`,
    },
    {
      title: "Where It All Began",
      image: "/images/first-machine.jpg",
      content: `Deeply moved by her legacy and fueled by a growing urge to build something uniquely my own, I decided to pick up the thread where she left off.

I bought a mini sewing machine, dove headfirst into late-night tutorials, and stitched my very first scrunchie. What started as a tribute to her has blossomed into a snazzy mission to bring high-quality, handcrafted joy to your everyday style.`,
    },
    {
      title: "The Scrunchiefrills Standard",
      image: "/images/premium-product.png",
      content: `We believe your hair accessories should be as slick as your ambition. After months of steady research and mastering the "know-hows" of premium textiles, the idea of Scrunchiefrills came to life.

We don’t just make hair ties; we create spiffy statements. Whether you’re looking for a zippy pop of color for a brunch date or a snappy, sophisticated silk for the office, every piece is designed to be slapping—durable, comfortable, and undeniably chic.`,
    },
  ];

  return (
    <div 
      className="min-h-screen w-full bg-scroll bg-repeat-y bg-[length:100%_auto] bg-top flex flex-col px-4 sm:px-6 md:px-8 pt-28 sm:pt-32 pb-16 sm:pb-24 overflow-x-hidden"
      style={{ backgroundImage: "url('/images/AboutPageBG.png')" }} // 🎀 Fixed background layer mapped cleanly for large vertical scales
    >
      <div className="max-w-6xl mx-auto w-full">

        {/* HEADER */}
        <div className="text-center mb-14 sm:mb-20 flex flex-col items-center">
          {/* 🎀 Our Story Bubble Graphic Heading */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-[280px] sm:max-w-[380px] md:max-w-[480px] mb-4 sm:mb-6 flex justify-center"
          >
            <img 
              src="/images/OurStoryHeading.png" 
              alt="Our Story" 
              className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-[0_4px_16px_rgba(224,33,113,0.25)]" 
            />
          </motion.div>
          
          {/* ⚡ Modified header text to look slim, airy, and slick */}
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light tracking-wide leading-relaxed text-[#E02171]/90 px-2">
            From a legacy of stitches to modern frills — a journey stitched with memory, passion, and style.
          </p>
        </div>

        {/* SECTIONS */}
        <div className="space-y-16 sm:space-y-24">
          {sections.map((section, i) => {
            const isReversed = i % 2 !== 0;

            return (
              <motion.div
                key={i}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 items-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                {/* IMAGE */}
                <div className={`w-full ${isReversed ? "md:order-2" : ""}`}>
                  <img
                    src={section.image}
                    alt={section.title}
                    className="rounded-2xl shadow-xl w-full h-[200px] sm:h-[260px] md:h-[300px] object-cover border border-[#E02171]/20"
                  />
                </div>

                {/* TEXT */}
                <div className={`text-left ${isReversed ? "md:order-1" : ""}`}>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-[#E02171]">
                    {section.title}
                  </h2>

                  {/* ⚡ Refactored text properties: transformed into thin weights, tracking extensions, and higher inline formatting spacing ratios */}
                  <p className="text-xs sm:text-sm md:text-base leading-relaxed tracking-wide font-light whitespace-pre-line text-[#E02171]/90">
                    {section.content}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FINAL SECTION */}
        <div className="text-center mt-20 sm:mt-28 px-2">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-[#E02171]">
            Join the Frill Fam
          </h2>

          {/* ⚡ Adjusted final text blocks to stay slim and consistent across viewports */}
          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed tracking-wide font-light text-[#E02171]/90">
            Every Scrunchiefrills piece carries a bit of that original "voilà!" moment—the magic of turning a simple piece of fabric into something extraordinary.
          </p>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base tracking-wide font-light text-[#E02171]/90">
            We’re so glad you’re here to be part of our story.
          </p>

          <p className="mt-5 sm:mt-6 italic font-bold text-base sm:text-lg text-[#E02171]">
            — Made with love 💖
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;