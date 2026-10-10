import { motion } from "framer-motion";

const posts = [
    "https://www.instagram.com/p/DanTJ_1IyBz/embed",
    "https://www.instagram.com/p/DT8XiprE8K-/embed",
    "https://www.instagram.com/p/DUn9v7FCQrx/embed",
    "https://www.instagram.com/p/DUpc0JuEYvV/embed",
    "https://www.instagram.com/p/DT-S8oTiVsK/embed",
    "https://www.instagram.com/p/DUM5B-lkakw/embed"
];

function InstagramFeed() {
    return (
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-[#FFF2F8] text-center overflow-hidden">

            {/* 📸 SEEN ON INSTAGRAM GRAPHIC HEADING */}
            <div className="flex justify-center items-center mb-3 sm:mb-4">
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="w-full max-w-[280px] sm:max-w-[380px] md:max-w-[460px] flex justify-center"
                >
                    <img
                        src="/images/InstagramFeedHeading.png"
                        alt="Seen on Instagram"
                        className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-[0_6px_18px_rgba(224,33,113,0.25)]"
                        onError={(e) => {
                            // Fallback in case of missing asset
                            e.target.style.display = "none";
                        }}
                    />
                </motion.div>
            </div>

            <p className="text-sm sm:text-base md:text-lg text-[#E02171]/80 font-medium mb-8 sm:mb-12 max-w-xl mx-auto tracking-wide">
                Follow us for scrunchie inspo and styling vibes
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 max-w-6xl mx-auto w-full">

                {posts.map((post, index) => (
                    <div key={index} className="w-full flex justify-center">
                        <iframe
                            src={post}
                            width="100%"
                            height="450"
                            frameBorder="0"
                            scrolling="no"
                            allowtransparency="true"
                            className="rounded-xl shadow-lg hover:scale-105 transition duration-300 w-full max-w-sm md:max-w-full h-[380px] sm:h-[420px] md:h-[450px]"
                        ></iframe>
                    </div>
                ))}

            </div>

            <a
                href="https://www.instagram.com/scrunchiefrills"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-8 sm:mt-10 px-7 sm:px-8 py-3 bg-pink-500 text-white font-bold text-sm sm:text-base rounded-full hover:bg-pink-600 transition active:scale-95 cursor-pointer select-none"
                style={{
                    boxShadow: "0 0 12px #E02171, 0 6px 20px rgba(224, 33, 113, 0.6)"
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                    "0 0 20px #E02171, 0 10px 30px rgba(224, 33, 113, 0.8)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow =
                    "0 0 12px #E02171, 0 6px 20px rgba(224, 33, 113, 0.6)")
                }
            >
                Follow @scrunchiefrills
            </a>

        </section>
    );
}

export default InstagramFeed;