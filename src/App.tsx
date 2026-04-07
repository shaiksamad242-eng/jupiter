/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, FormEvent } from 'react';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [isMobMenuOpen, setIsMobMenuOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const go = (id: string) => {
    setActivePage(id);
    setIsMobMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const fullUrl = `${window.location.origin}/api/send-email`;
      console.log("Submitting to:", fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text (first 200 chars):", responseText.substring(0, 200));
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error(`Server returned an invalid response format (likely HTML instead of JSON). Status: ${response.status}. Response starts with: ${responseText.substring(0, 50)}...`);
      }

      if (response.ok) {
        setFormSubmitted(true);
        // Reset after 10 seconds
        setTimeout(() => setFormSubmitted(false), 10000);
      } else {
        setFormError(result.error || "Failed to send application. Please try again later.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormError(`A network error occurred: ${error instanceof Error ? error.message : String(error)}. Please check your connection.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Cursor Logic
    const cur = document.getElementById('cursor');
    const handleMouseMove = (e: MouseEvent) => {
      if (cur) {
        cur.style.left = e.clientX + 'px';
        cur.style.top = e.clientY + 'px';
      }
    };
    document.addEventListener('mousemove', handleMouseMove);

    const handleMouseEnter = () => cur?.classList.add('big');
    const handleMouseLeave = () => cur?.classList.remove('big');

    const interactiveEls = document.querySelectorAll('a,button,.sc,.pc,.bcard,.job,.vcard,.iitem');
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      interactiveEls.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [activePage]);

  useEffect(() => {
    // Reveal Logic
    const triggerReveal = () => {
      const pg = document.querySelector('.page.active');
      if (!pg) return;
      const els = pg.querySelectorAll('.rv,.rvl,.rvr');
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => (e.target as HTMLElement).classList.add('in'), i * 70);
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.1 });
      els.forEach(el => {
        el.classList.remove('in');
        io.observe(el);
      });
    };

    const timer = setTimeout(triggerReveal, 80);
    return () => clearTimeout(timer);
  }, [activePage]);

  return (
    <>
      <div id="cursor"></div>

      {/* MOBILE MENU */}
      <div className={`mob-menu ${isMobMenuOpen ? 'open' : ''}`} id="mobMenu">
        <button className="mob-close" id="mobClose" onClick={() => setIsMobMenuOpen(false)}>✕</button>
        <a onClick={() => go('home')}>Home</a>
        <a onClick={() => go('about')}>About</a>
        <a onClick={() => go('services')}>Services</a>
        <a onClick={() => go('process')}>Process</a>
        <a onClick={() => go('portfolio')}>Portfolio</a>
        <a onClick={() => go('testimonials')}>Testimonials</a>
        <a onClick={() => go('blog')}>Blog</a>
        <a onClick={() => go('careers')}>Careers</a>
        <a onClick={() => go('contact')}>Contact</a>
      </div>

      {/* NAV */}
      <nav>
        <div className="nav-logo" onClick={() => go('home')}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="url(#ng1)" />
            <path d="M22 50 Q50 18 78 50 Q50 82 22 50Z" fill="white" opacity="0.92" />
            <path d="M28 40 Q50 26 72 40" stroke="white" strokeWidth="3.5" fill="none" opacity="0.55" />
            <path d="M28 60 Q50 74 72 60" stroke="white" strokeWidth="3.5" fill="none" opacity="0.55" />
            <defs>
              <linearGradient id="ng1" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#ff2d78" />
                <stop offset="50%" stopColor="#ff6b6b" />
                <stop offset="100%" stopColor="#ffbe0b" />
              </linearGradient>
            </defs>
          </svg>
          <span className="nav-logo-text">Jupiter Infotech</span>
        </div>
        <ul className="nav-links">
          <li><a onClick={() => go('home')} className={activePage === 'home' ? 'active' : ''} data-p="home">Home</a></li>
          <li><a onClick={() => go('about')} className={activePage === 'about' ? 'active' : ''} data-p="about">About</a></li>
          <li><a onClick={() => go('services')} className={activePage === 'services' ? 'active' : ''} data-p="services">Services</a></li>
          <li><a onClick={() => go('process')} className={activePage === 'process' ? 'active' : ''} data-p="process">Process</a></li>
          <li><a onClick={() => go('portfolio')} className={activePage === 'portfolio' ? 'active' : ''} data-p="portfolio">Portfolio</a></li>
          <li><a onClick={() => go('testimonials')} className={activePage === 'testimonials' ? 'active' : ''} data-p="testimonials">Testimonials</a></li>
          <li><a onClick={() => go('blog')} className={activePage === 'blog' ? 'active' : ''} data-p="blog">Blog</a></li>
          <li><a onClick={() => go('careers')} className={activePage === 'careers' ? 'active' : ''} data-p="careers">Careers</a></li>
          <li><a onClick={() => go('contact')} className={activePage === 'contact' ? 'active' : ''} data-p="contact">Contact</a></li>
        </ul>
        <button className="nav-cta" onClick={() => go('about')}>Learn More</button>
        <button className="hamburger" id="hamBtn" onClick={() => setIsMobMenuOpen(true)}>
          <span></span><span></span><span></span>
        </button>
      </nav>

      {/* ===== HOME ===== */}
      <div className={`page ${activePage === 'home' ? 'active' : ''}`} id="pg-home">
        <section className="hero">
          <div className="blob b1"></div><div className="blob b2"></div><div className="blob b3"></div><div className="blob b4"></div>
          <div className="hero-inner">
            <div className="hbadge"><span className="bdot"></span>Infotech & Business Solutions</div>
            <div className="hloc">📍 Bangalore · Gulbarga · Karnataka</div>
            <h1><span className="gt">Jupiter</span><br />Infotech</h1>
            <p className="hero-sub">Quality, Efficiency, Innovation — delivering high-quality IT and business services that power your business growth and build lasting partnerships worldwide.</p>
            <div className="hbtns">
              <button className="btn-f" onClick={() => go('services')}>Our Services</button>
            </div>
            <div className="hstats">
              <div><div className="hsn">Quality</div><div className="hsl">Driven Processes</div></div>
              <div><div className="hsn">24/7</div><div className="hsl">Client Support</div></div>
              <div><div className="hsn">15+</div><div className="hsl">Industries Served</div></div>
              <div><div className="hsn">100%</div><div className="hsl">Commitment</div></div>
            </div>
          </div>
        </section>
        <div className="rainbow-bar"></div>
        <div className="ticker">
          <div className="ttrack">
            <div className="titem"><span className="tnum">Quality</span><span className="tlbl">Excellence</span></div><span className="tdot">✦</span>
            <div className="titem"><span className="tnum">Efficiency</span><span className="tlbl">Streamlined Ops</span></div><span className="tdot">✦</span>
            <div className="titem"><span className="tnum">Innovation</span><span className="tlbl">Continuous Growth</span></div><span className="tdot">✦</span>
            <div className="titem"><span className="tnum">Integrity</span><span className="tlbl">Core Value</span></div><span className="tdot">✦</span>
            <div className="titem"><span className="tnum">Trust</span><span className="tlbl">Built to Last</span></div><span className="tdot">✦</span>
            <div className="titem"><span className="tnum">Quality</span><span className="tlbl">Excellence</span></div><span className="tdot">✦</span>
            <div className="titem"><span className="tnum">Efficiency</span><span className="tlbl">Streamlined Ops</span></div><span className="tdot">✦</span>
            <div className="titem"><span className="tnum">Innovation</span><span className="tlbl">Continuous Growth</span></div><span className="tdot">✦</span>
            <div className="titem"><span className="tnum">Integrity</span><span className="tlbl">Core Value</span></div><span className="tdot">✦</span>
            <div className="titem"><span className="tnum">Trust</span><span className="tlbl">Built to Last</span></div><span className="tdot">✦</span>
          </div>
        </div>
        <div className="mq-wrap">
          <div className="mq-track">
            <span className="mq-item">Customer Support & Sales <span className="mq-star">✦</span></span>
            <span className="mq-item">Back Office <span className="mq-star">✦</span></span>
            <span className="mq-item">IT Helpdesk <span className="mq-star">✦</span></span>
            <span className="mq-item">E-commerce & Retail <span className="mq-star">✦</span></span>
            <span className="mq-item">Banking & Finance <span className="mq-star">✦</span></span>
            <span className="mq-item">Healthcare <span className="mq-star">✦</span></span>
            <span className="mq-item">Startups & SMEs <span className="mq-star">✦</span></span>
            <span className="mq-item">Customer Support & Sales <span className="mq-star">✦</span></span>
            <span className="mq-item">Back Office <span className="mq-star">✦</span></span>
            <span className="mq-item">IT Helpdesk <span className="mq-star">✦</span></span>
            <span className="mq-item">E-commerce & Retail <span className="mq-star">✦</span></span>
            <span className="mq-item">Banking & Finance <span className="mq-star">✦</span></span>
            <span className="mq-item">Healthcare <span className="mq-star">✦</span></span>
            <span className="mq-item">Startups & SMEs <span className="mq-star">✦</span></span>
          </div>
        </div>
        <section className="home-why">
          <div className="hw-inner">
            <div className="hw-text rvl">
              <div className="slabel">Why Jupiter Infotech</div>
              <h2>Quality, Efficiency,<br /><span className="gt">Innovation</span></h2>
              <p>At Jupiter Infotech, we prioritize quality standards that ensure client satisfaction and optimal performance. Our commitment to excellence drives every aspect of our operations, fostering trust and reliability.</p>
              <p>We implement efficient processes that streamline workflows, reduce turnaround times, and enhance productivity — delivering cost-effective solutions that meet the evolving needs of our clients.</p>
              <button className="btn-f" onClick={() => go('about')} style={{ marginTop: '.6rem' }}>Learn More</button>
            </div>
            <div className="mc rvr">
              <div className="mcard"><div className="mi">🏆</div><div className="mt">Experienced Team</div><div className="md">Seasoned management team with deep industry expertise.</div></div>
              <div className="mcard"><div className="mi">📈</div><div className="mt">Scalable Workforce</div><div className="md">Grow or scale back with zero friction — we adapt to you.</div></div>
              <div className="mcard"><div className="mi">✅</div><div className="mt">Quality-Driven</div><div className="md">Rigorous QA processes baked into every operation.</div></div>
              <div className="mcard"><div className="mi">💡</div><div className="mt">Client-Focused</div><div className="md">Your success is our mission — every day, every process.</div></div>
            </div>
          </div>
        </section>
        <Footer go={go} />
      </div>

      {/* ===== ABOUT ===== */}
      <div className={`page ${activePage === 'about' ? 'active' : ''}`} id="pg-about">
        <div className="pt-nav"></div><div className="rainbow-bar"></div>
        <div className="about-hero"><h1>About Jupiter Infotech</h1><p>Quality, Efficiency, Innovation — the three pillars that define everything we do at Jupiter Infotech, based in Bangalore and Gulbarga, Karnataka.</p></div>
        <section className="vals-sec">
          <div className="vi">
            <div className="rv" style={{ textAlign: 'center' }}><div className="slabel">Core Values</div><h2>What We <span className="gt">Stand For</span></h2></div>
            <div className="vgrid">
              <div className="vcard rv"><div className="vicon">🤝</div><div className="vtitle">Integrity</div><div className="vdesc">We operate with honesty and transparency in every client relationship and business decision we make.</div></div>
              <div className="vcard rv"><div className="vicon">🏆</div><div className="vtitle">Excellence</div><div className="vdesc">We strive to deliver the highest quality service, setting standards that exceed client expectations every time.</div></div>
              <div className="vcard rv"><div className="vicon">💪</div><div className="vtitle">Commitment</div><div className="vdesc">Dedicated to client success and satisfaction — your goals are our goals, from day one to long-term partnership.</div></div>
              <div className="vcard rv"><div className="vicon">💡</div><div className="vtitle">Innovation</div><div className="vdesc">Continuously improving processes and solutions to stay ahead and deliver smarter outcomes for our clients.</div></div>
              <div className="vcard rv"><div className="vicon">🌐</div><div className="vtitle">Teamwork</div><div className="vdesc">Working together — internally and with our clients — to achieve shared goals and drive mutual growth.</div></div>
            </div>
          </div>
        </section>
        <section className="mvv-sec">
          <div className="mvv-i">
            <div className="mvv-card rv"><div className="mvv-icon">🎯</div><h3>Our Mission</h3><ul>
              <li>Deliver high-quality Infotech services to clients worldwide</li>
              <li>Build long-term partnerships based on trust and performance</li>
              <li>Provide cost-effective and scalable solutions</li>
              <li>Continuously improve through technology and skilled talent</li>
            </ul></div>
            <div className="mvv-card rv"><div className="mvv-icon">🔭</div><h3>Our Vision</h3><ul>
              <li>Become a trusted global technology partner</li>
              <li>Deliver reliable and high-quality Infotech services</li>
              <li>Build long-term partnerships with clients worldwide</li>
              <li>Drive business growth through innovation and efficiency</li>
              <li>Create a skilled and empowered workforce</li>
            </ul></div>
            <div className="mvv-card rv"><div className="mvv-icon">⭐</div><h3>Why Choose Jupiter?</h3><ul>
              <li>Experienced management team</li>
              <li>Scalable workforce</li>
              <li>Quality-driven processes</li>
              <li>Competitive pricing</li>
              <li>Client-focused service approach</li>
            </ul></div>
          </div>
        </section>
        <Footer go={go} />
      </div>

      {/* ===== SERVICES ===== */}
      <div className={`page ${activePage === 'services' ? 'active' : ''}`} id="pg-services">
        <div className="pt-nav"></div><div className="rainbow-bar"></div>
        <section className="port-sec">
          <div className="port-i">
            <div className="port-h rv"><div className="slabel">Success Stories</div><h2>Client <span className="gt">Collaborations</span></h2><p>Our clients have achieved remarkable results — significant cost savings and enhanced customer satisfaction — fostering long-term partnerships that drive mutual growth.</p></div>
            <div className="port-intro rv"><h3>Client Collaborations</h3><p>Our clients have achieved remarkable results through our services, including significant cost savings and enhanced customer satisfaction, fostering long-term partnerships that drive mutual growth.</p></div>
            <div className="pgrid">
              <div className="pc rv"><div className="pimg pi0">🎧</div><div className="pb"><div className="ptag">Customer Support & Sales</div><h3>Telecom Company — CX Overhaul</h3><p>Redesigned customer support, reducing response times and improving first-call resolution across all channels, resulting in measurable CSAT improvements.</p><span className="pres">↑ CSAT Score · ↓ Handle Time</span></div></div>
              <div className="pc rv"><div className="pimg pi1">💼</div><div className="pb"><div className="ptag">Back Office</div><h3>E-commerce Brand — Back Office Scale</h3><p>Streamlined order management and data processing, enabling the client to handle 3x volume during peak seasons without added overhead costs.</p><span className="pres">3x Volume · Zero Extra Cost</span></div></div>
              <div className="pc rv"><div className="pimg pi2">💻</div><div className="pb"><div className="ptag">IT Helpdesk</div><h3>Software Firm — 24/7 IT Support</h3><p>Stood up a dedicated IT helpdesk team achieving sub-2-minute response times and 99%+ uptime SLA compliance for all critical systems.</p><span className="pres">99% Uptime · &lt;2 Min Response</span></div></div>
              <div className="pc rv"><div className="pimg pi3">🏥</div><div className="pb"><div className="ptag">Healthcare & Medical Support</div><h3>Healthcare Provider — Medical Infotech</h3><p>Managed patient support, scheduling, and billing — enabling the clinical team to focus entirely on patient care while we handled operations.</p><span className="pres">↑ Patient Satisfaction</span></div></div>
              <div className="pc rv"><div className="pimg pi4">🏦</div><div className="pb"><div className="ptag">Banking & Financial Services</div><h3>NBFC — Finance Process Outsourcing</h3><p>Took over loan processing and customer query management, reducing turnaround time by over 40% with zero compliance issues reported.</p><span className="pres">40% Faster TAT · 0 Compliance Issues</span></div></div>
              <div className="pc rv"><div className="pimg pi5">🚀</div><div className="pb"><div className="ptag">Startups & SMEs</div><h3>D2C Startup — Full Infotech Partnership</h3><p>Provided end-to-end customer support and back-office from launch — enabling founders to scale without building an ops team in-house.</p><span className="pres">Live in 2 Weeks · 5-Star Reviews</span></div></div>
            </div>
          </div>
        </section>
        <Footer go={go} />
      </div>

      {/* ===== PROCESS ===== */}
      <div className={`page ${activePage === 'process' ? 'active' : ''}`} id="pg-process">
        <div className="pt-nav"></div><div className="rainbow-bar"></div>
        <section className="proc-sec">
          <div className="proc-i">
            <div className="proc-h rv"><div className="slabel">How We Work</div><h2>Client <span className="gt">Engagement Process</span></h2><p>A structured, transparent, and client-first approach — from initial consultation to continuous performance monitoring.</p></div>
            <div className="proc-grid">
              <div className="pstep rv"><div className="pnum">01</div><div className="pico">🤝</div><h3>Onboarding</h3><p>Initial consultation to understand client needs and tailor our approach. We take time to deeply understand your business, goals, and specific requirements before anything else.</p></div>
              <div className="pstep rv"><div className="pnum">02</div><div className="pico">🎨</div><h3>Solution Design</h3><p>Customized solution development based on gathered insights for optimal results. Every engagement is designed from scratch — no off-the-shelf packages, only tailored solutions.</p></div>
              <div className="pstep rv"><div className="pnum">03</div><div className="pico">🚀</div><h3>Implementation</h3><p>Efficient rollout of services, ensuring smooth integration with client operations. Our experienced team manages the transition so you experience zero disruption.</p></div>
              <div className="pstep rv"><div className="pnum">04</div><div className="pico">📊</div><h3>Performance Monitoring</h3><p>Continuous assessment and refinement to maximize service efficiency and effectiveness. We track KPIs, share transparent reports, and proactively optimize at every stage.</p></div>
            </div>
          </div>
        </section>
        <section className="engage-sec">
          <div className="eng-i rv">
            <div className="slabel">Next Steps</div>
            <h2>Ready to <span className="gt">Get Started?</span></h2>
            <p>Schedule a personalized consultation to discuss your specific needs and request a detailed proposal outlining our services and tailored pricing options to suit your business requirements.</p>
            <div className="eng-btns">
              <button className="btn-f" onClick={() => go('services')}>Explore Services</button>
            </div>
          </div>
        </section>
        <Footer go={go} />
      </div>

      {/* ===== PORTFOLIO ===== */}
      <div className={`page ${activePage === 'portfolio' ? 'active' : ''}`} id="pg-portfolio">
        <div className="pt-nav"></div><div className="rainbow-bar"></div>
        <div className="svc-hero"><h1>Our Comprehensive<br />Infotech Service Offerings</h1><p>Providing exceptional service across multiple communication channels — Customer Support, Back Office, and IT Helpdesk.</p></div>
        <section className="svc-main">
          <div className="si">
            <div className="sgrid">
              <div className="sc rv"><div className="sn">01</div><h3>Customer Support & Sales</h3><p>Providing exceptional service across multiple communication channels — voice, chat, email, and social. Every interaction reflects your brand at its very best, 24/7.</p><span className="sarr">↗</span></div>
              <div className="sc rv"><div className="sn">02</div><h3>Back Office Operations</h3><p>Streamlining operations through efficient data management processes — data entry, processing, verification, and document management with precision and speed.</p><span className="sarr">↗</span></div>
              <div className="sc rv"><div className="sn">03</div><h3>IT Helpdesk Support</h3><p>Delivering timely resolutions for all technical inquiries — 24/7 helpdesk, infrastructure monitoring, and technical resolution keeping your operations running without interruption.</p><span className="sarr">↗</span></div>
              <div className="sc rv"><div className="sn">04</div><h3>Finance & Accounting</h3><p>End-to-end F&A: AP/AR, payroll, reconciliation, and financial reporting with full accuracy, compliance, and transparency at every step.</p><span className="sarr">↗</span></div>
              <div className="sc rv"><div className="sn">05</div><h3>HR Process Outsourcing</h3><p>From talent acquisition and onboarding to payroll and compliance — we handle the full HR lifecycle so your team can focus on what matters most.</p><span className="sarr">↗</span></div>
              <div className="sc rv"><div className="sn">06</div><h3>Data Management & Analytics</h3><p>Transform raw data into decision-ready intelligence through robust management, cleansing, and analytics pipelines — structured, insightful, and actionable.</p><span className="sarr">↗</span></div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '3.5rem' }} className="rv"></div>
          </div>
        </section>
        <section className="ind-sec">
          <div className="ind-i">
            <div className="ind-h rv"><div className="slabel">Industries We Serve</div><h2>Serving <span className="gt">15+ Industries</span></h2><p>Our Infotech expertise spans a wide range of sectors, bringing domain knowledge to every engagement.</p></div>
            <div className="igrid rv">
              <div className="iitem"><div className="iico">🛒</div>E-commerce & Retail</div>
              <div className="iitem"><div className="iico">📡</div>Telecommunications</div>
              <div className="iitem"><div className="iico">🏦</div>Banking & Financial Services</div>
              <div className="iitem"><div className="iico">🏥</div>Healthcare & Medical Support</div>
              <div className="iitem"><div className="iico">🛡️</div>Insurance</div>
              <div className="iitem"><div className="iico">💻</div>Technology & Software</div>
              <div className="iitem"><div className="iico">🏠</div>Real Estate</div>
              <div className="iitem"><div className="iico">✈️</div>Travel & Hospitality</div>
              <div className="iitem"><div className="iico">🎓</div>Education & E-Learning</div>
              <div className="iitem"><div className="iico">🚚</div>Logistics & Supply Chain</div>
              <div className="iitem"><div className="iico">🚗</div>Automotive Industry</div>
              <div className="iitem"><div className="iico">🎬</div>Media & Entertainment</div>
              <div className="iitem"><div className="iico">⚡</div>Energy & Utilities</div>
              <div className="iitem"><div className="iico">🚀</div>Startups & SMEs</div>
              <div className="iitem"><div className="iico">📣</div>Marketing & Advertising Agencies</div>
            </div>
          </div>
        </section>
        <section className="adv-sec">
          <div className="adv-i">
            <div className="adv-h rv"><div className="slabel">Competitive Advantages</div><h2>Key Differentiators of <span className="gt">Jupiter Infotech</span></h2></div>
            <div className="adv-grid rv">
              <div className="adv-card"><h3>🔄 Flexible Solutions</h3><p>Our services offer adaptable and scalable options that grow with your business, allowing clients to choose the level of support that fits their unique requirements — without rigid contracts.</p></div>
              <div className="adv-card"><h3>⚙️ Advanced Technology</h3><p>We integrate cutting-edge technology into our operations, ensuring clients benefit from efficient processes and tools that enhance productivity while avoiding the limitations of outdated legacy systems.</p></div>
            </div>
          </div>
        </section>
        <section className="tech-sec">
          <div className="tech-i">
            <div className="tech-t rvl"><div className="slabel">Technology Infrastructure</div><h2>Cloud-Powered <span className="gt">Operations</span></h2><p>Our state-of-the-art cloud-based CRM and communication platforms ensure seamless integration, promoting efficiency and collaboration within our teams while maintaining high standards of data security.</p><p>We continuously invest in technology to stay ahead — so our clients always benefit from the most efficient, secure, and scalable infrastructure available.</p><div className="tbadge">☁️ Cloud Solutions Enabled</div></div>
            <div className="tech-v rvr"><h3>Our Technology Stack</h3><ul className="tlist"><li>Cloud-based CRM & communication platforms</li><li>Seamless system integration & API connectivity</li><li>Real-time performance monitoring dashboards</li><li>Advanced data security & encryption protocols</li><li>AI-assisted workflows & automation tools</li><li>Omnichannel support platforms (voice, chat, email)</li></ul></div>
          </div>
        </section>
        <Footer go={go} />
      </div>

      {/* ===== TESTIMONIALS ===== */}
      <div className={`page ${activePage === 'testimonials' ? 'active' : ''}`} id="pg-testimonials">
        <div className="pt-nav"></div><div className="rainbow-bar"></div>
        <section className="test-sec">
          <div className="test-i">
            <div className="test-h rv"><div className="slabel">Client Voices</div><h2>What Our Clients<br /><span className="gt">Say About Us</span></h2><p>Our commitment to quality and client satisfaction speaks through the words of those we partner with every day.</p></div>
            <div className="tfeat rv">
              <div className="stars"><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span></div>
              <p className="ttxt">"Jupiter Infotech transformed our customer support operations completely. Their team understood our business from day one, and the quality of service they deliver has directly contributed to a significant improvement in our customer satisfaction scores. We consider them a true long-term partner."</p>
              <div className="tauth"><div className="tav">👔</div><div><div className="tname">Operations Head</div><div className="tco" style={{ color: 'rgba(255,255,255,.55)' }}>Leading E-commerce Company, Bangalore</div></div></div>
            </div>
            <div className="tgrid">
              <div className="tcard rv"><div className="stars"><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span></div><div className="tq">"</div><p className="ttxt">The back-office team at Jupiter handles our data processing with incredible accuracy and speed. We've reduced errors by over 60% since partnering with them.</p><div className="tauth"><div className="tav">👩</div><div><div className="tname">Director, Operations</div><div className="tco">NBFC, Karnataka</div></div></div></div>
              <div className="tcard rv"><div className="stars"><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span></div><div className="tq">"</div><p className="ttxt">Their IT helpdesk team is always available and resolves issues faster than any in-house team we've had. SLA adherence is exceptional — truly world-class support.</p><div className="tauth"><div className="tav">👨</div><div><div className="tname">CTO</div><div className="tco">Software Company, Bangalore</div></div></div></div>
              <div className="tcard rv"><div className="stars"><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span></div><div className="tq">"</div><p className="ttxt">Jupiter Infotech helped us launch our customer operations in just 2 weeks. For a startup, that kind of speed and reliability is invaluable. Highly recommend them.</p><div className="tauth"><div className="tav">👩</div><div><div className="tname">Founder & CEO</div><div className="tco">D2C Startup, India</div></div></div></div>
              <div className="tcard rv"><div className="stars"><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span></div><div className="tq">"</div><p className="ttxt">Unlike other Infotech vendors, Jupiter takes time to truly understand our processes before jumping in. That client-focused approach makes all the difference in quality.</p><div className="tauth"><div className="tav">👨</div><div><div className="tname">VP Customer Experience</div><div className="tco">Telecom Company</div></div></div></div>
              <div className="tcard rv"><div className="stars"><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span></div><div className="tq">"</div><p className="ttxt">Cost savings of over 35% in our first year alone — and the quality actually improved. Jupiter delivers real value through their competitive and transparent pricing.</p><div className="tauth"><div className="tav">👩</div><div><div className="tname">CFO</div><div className="tco">Healthcare Provider, Karnataka</div></div></div></div>
              <div className="tcard rv"><div className="stars"><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span></div><div className="tq">"</div><p className="ttxt">Jupiter's team feels like an extension of our own. They're proactive, transparent, and genuinely invested in our success. We've expanded our engagement twice.</p><div className="tauth"><div className="tav">👨</div><div><div className="tname">Managing Director</div><div className="tco">Real Estate Firm, Gulbarga</div></div></div></div>
            </div>
          </div>
        </section>
        <Footer go={go} />
      </div>

      {/* ===== BLOG ===== */}
      <div className={`page ${activePage === 'blog' ? 'active' : ''}`} id="pg-blog">
        <div className="pt-nav"></div><div className="rainbow-bar"></div>
        <section className="blog-sec">
          <div className="blog-i">
            <div className="blog-h rv"><div className="slabel">Insights & Ideas</div><h2>The Jupiter <span className="gt">Blog</span></h2><p>Thought leadership, industry insights, and practical advice from the experts at Jupiter Infotech.</p></div>
            <div className="bgrid">
              <div className="bcard rv"><div className="bthumb bt0">📈</div><div className="bbody"><div className="bmeta"><span className="bcat">Operations</span><span className="bdate">Mar 2026</span></div><h3>How Quality-Driven Processes Boost Client Retention</h3><p>Explore how maintaining rigorous quality standards in operations directly translates to higher client retention and long-term partnerships.</p><span className="rm">Read Article →</span></div></div>
              <div className="bcard rv"><div className="bthumb bt1">☁️</div><div className="bbody"><div className="bmeta"><span className="bcat">Technology</span><span className="bdate">Mar 2026</span></div><h3>Cloud-Based CRM: The Backbone of Modern Operations</h3><p>How cloud solutions are transforming service delivery — improving collaboration, security, and efficiency across distributed teams.</p><span className="rm">Read Article →</span></div></div>
              <div className="bcard rv"><div className="bthumb bt2">🌍</div><div className="bbody"><div className="bmeta"><span className="bcat">Industry</span><span className="bdate">Feb 2026</span></div><h3>Why Indian Infotech Companies Are the Global Choice</h3><p>India's technology industry continues to lead globally — driven by skilled talent, cost advantages, and a culture of service excellence.</p><span className="rm">Read Article →</span></div></div>
              <div className="bcard rv"><div className="bthumb bt3">🔐</div><div className="bbody"><div className="bmeta"><span className="bcat">Compliance</span><span className="bdate">Feb 2026</span></div><h3>Data Security: What Every Client Should Demand</h3><p>Your technology partner handles sensitive data. Here's what security practices and standards you should insist upon before signing any agreement.</p><span className="rm">Read Article →</span></div></div>
              <div className="bcard rv"><div className="bthumb bt4">🚀</div><div className="bbody"><div className="bmeta"><span className="bcat">Startups & SMEs</span><span className="bdate">Jan 2026</span></div><h3>How Startups Can Scale Fast with Infotech Support</h3><p>For early-stage companies, outsourcing non-core operations to a technology partner can be the fastest path to scale without burning through runway.</p><span className="rm">Read Article →</span></div></div>
              <div className="bcard rv"><div className="bthumb bt5">📊</div><div className="bbody"><div className="bmeta"><span className="bcat">Strategy</span><span className="bdate">Jan 2026</span></div><h3>5 Signs Your Business Is Ready to Outsource Operations</h3><p>Not sure if Infotech is right for you? These five signals indicate it's time to bring in an expert partner like Jupiter Infotech.</p><span className="rm">Read Article →</span></div></div>
            </div>
          </div>
        </section>
        <Footer go={go} />
      </div>

      {/* ===== CAREERS ===== */}
      <div className={`page ${activePage === 'careers' ? 'active' : ''}`} id="pg-careers">
        <div className="pt-nav"></div><div className="rainbow-bar"></div>
        <section className="car-sec">
          <div className="car-i">
            <div className="car-h rv"><div className="slabel">Join Our Team</div><h2>Build Your Career<br />at <span className="gt">Jupiter Infotech</span></h2><p>We're looking for passionate, driven people to join a team redefining technology services in Bangalore, Gulbarga, and Karnataka. Come grow with us.</p></div>
            <div className="perks rv">
              <div className="perk"><div className="perk-ico">🏥</div><h4>Health Benefits</h4><p>Medical coverage for you and your family, because we care about your wellbeing.</p></div>
              <div className="perk"><div className="perk-ico">📚</div><h4>Learning & Growth</h4><p>Continuous training, upskilling programs, and career development opportunities.</p></div>
              <div className="perk"><div className="perk-ico">🌟</div><h4>Performance Rewards</h4><p>Competitive salaries, performance bonuses, and recognition programs.</p></div>
              <div className="perk"><div className="perk-ico">🤝</div><h4>Great Culture</h4><p>A collaborative, inclusive, and supportive work environment where teamwork thrives.</p></div>
            </div>
            <div className="jtitle rv">Current Openings</div>
            <div className="jobs">
              <div className="job rv"><div><div className="jt">Customer Support Executive</div><div className="jtags"><span className="jtag">Full-time</span><span className="jtag">Bangalore</span><span className="jtag">Entry / Mid Level</span></div></div></div>
              <div className="job rv"><div><div className="jt">Back Office Data Entry Specialist</div><div className="jtags"><span className="jtag">Full-time</span><span className="jtag">Gulbarga</span><span className="jtag">Entry Level</span></div></div></div>
              <div className="job rv"><div><div className="jt">IT Helpdesk Technician</div><div className="jtags"><span className="jtag">Full-time</span><span className="jtag">Bangalore</span><span className="jtag">Mid Level</span></div></div></div>
              <div className="job rv"><div><div className="jt">Team Leader — Customer Support</div><div className="jtags"><span className="jtag">Full-time</span><span className="jtag">Bangalore / Gulbarga</span><span className="jtag">Senior</span></div></div></div>
              <div className="job rv"><div><div className="jt">Operations Manager</div><div className="jtags"><span className="jtag">Full-time</span><span className="jtag">Bangalore</span><span className="jtag">Senior</span></div></div></div>
            </div>
            <div style={{ marginTop: '3rem', textAlign: 'center' }} className="rv">
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>To apply, please use the <a onClick={() => go('contact')} style={{ color: 'var(--pink)', fontWeight: 600, cursor: 'pointer' }}>Contact Form</a> or send your resume to <a href="mailto:manager@jupiterinfotech.co.in" style={{ color: 'var(--pink)', fontWeight: 600 }}>manager@jupiterinfotech.co.in</a></p>
            </div>
          </div>
        </section>
        <Footer go={go} />
      </div>

      {/* ===== CONTACT ===== */}
      <div className={`page ${activePage === 'contact' ? 'active' : ''}`} id="pg-contact">
        <div className="pt-nav"></div><div className="rainbow-bar"></div>
        <section className="cont-sec">
          <div className="cont-i">
            <div className="cont-h rv">
              <div className="slabel">Contact Us</div>
              <h2>Get in <span className="gt">Touch</span></h2>
              <p>Have questions or ready to start your journey with Jupiter Infotech? Reach out to us through any of the channels below. Our team is ready to assist you.</p>
            </div>
            <div className="cgrid">
              <div className="ccard rv" style={{ gridColumn: '1 / -1', maxWidth: '800px', margin: '0 auto' }}>
                <div className="cico">📝</div>
                <h3>Application Form</h3>
                {formSubmitted ? (
                  <div className="rv in" style={{ padding: '3rem 0', textAlign: 'center' }}>
                    <div className="vicon" style={{ fontSize: '4rem', marginBottom: '1.5rem', display: 'block' }}>✅</div>
                    <h3 style={{ color: 'var(--pink)', marginBottom: '1rem', fontSize: '2rem' }}>Sent!</h3>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>We will get back to you soon.</p>
                    <button className="btn-o" onClick={() => setFormSubmitted(false)} style={{ marginTop: '2rem' }}>Send Another Application</button>
                  </div>
                ) : (
                  <>
                    <p>Fill out the details below to apply or get in touch.</p>
                    <form className="cform" onSubmit={handleFormSubmit}>
                      <div className="frow">
                        <div className="fg">
                          <label>Full Name</label>
                          <input type="text" name="name" required placeholder="Your Name" disabled={isSubmitting} />
                        </div>
                        <div className="fg">
                          <label>Email Address</label>
                          <input type="email" name="email" required placeholder="Your Email" disabled={isSubmitting} />
                        </div>
                      </div>
                      <div className="frow">
                        <div className="fg">
                          <label>Phone Number</label>
                          <input type="tel" name="phone" required placeholder="+91 ..." disabled={isSubmitting} />
                        </div>
                        <div className="fg">
                          <label>Experience (Years)</label>
                          <input type="number" name="experience" required placeholder="e.g. 2" disabled={isSubmitting} />
                        </div>
                      </div>
                      <div className="fg">
                        <label>Role Looking For</label>
                        <input type="text" name="role" required placeholder="e.g. Customer Support Executive" disabled={isSubmitting} />
                      </div>
                      {formError && (
                        <div style={{ color: '#ff4d4d', fontSize: '0.85rem', marginTop: '0.5rem', background: 'rgba(255,77,77,0.1)', padding: '0.75rem', borderRadius: '8px' }}>
                          ⚠️ {formError}
                        </div>
                      )}
                      <button type="submit" className="btn-f" style={{ width: '100%', marginTop: '1rem', opacity: isSubmitting ? 0.7 : 1 }} disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'Submit Application'}
                      </button>
                    </form>
                  </>
                )}
              </div>
              <div className="ccard rv">
                <div className="cico">📞</div>
                <h3>Phone</h3>
                <p>Call us for immediate assistance:</p>
                <div className="clinks">
                  <a href="tel:+919972135467">+91 99721 35467</a>
                  <a href="tel:+919606975325">+91 96069 75325</a>
                  <a href="tel:+918050266702">+91 80502 66702</a>
                </div>
              </div>
              <div className="ccard rv">
                <div className="cico">✉️</div>
                <h3>Email</h3>
                <p>Send us an email anytime:</p>
                <div className="clinks">
                  <a href="mailto:gm@jupiterinfotech.co.in">gm@jupiterinfotech.co.in</a>
                  <a href="mailto:manager@jupiterinfotech.co.in">manager@jupiterinfotech.co.in</a>
                </div>
              </div>
              <div className="ccard rv">
                <div className="cico">📍</div>
                <h3>Locations</h3>
                <p>Our operational hubs:</p>
                <div className="clinks">
                  <span>Bangalore, Karnataka</span>
                  <span>Gulbarga, Karnataka</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer go={go} />
      </div>
    </>
  );
}

function Footer({ go }: { go: (id: string) => void }) {
  return (
    <footer>
      <div className="fl">
        <svg viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="48" fill="url(#fg1)" />
          <path d="M22 50 Q50 18 78 50 Q50 82 22 50Z" fill="white" opacity="0.92" />
          <defs>
            <linearGradient id="fg1" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor="#ff2d78" />
              <stop offset="100%" stopColor="#ffbe0b" />
            </linearGradient>
          </defs>
        </svg>
        <span className="fl-t">Jupiter Infotech</span>
      </div>
      <div className="flinks">
        <a onClick={() => go('about')}>About</a>
        <a onClick={() => go('services')}>Services</a>
        <a onClick={() => go('portfolio')}>Portfolio</a>
        <a onClick={() => go('blog')}>Blog</a>
        <a onClick={() => go('careers')}>Careers</a>
        <a onClick={() => go('contact')}>Contact</a>
      </div>
      <div className="finfo">
        <div className="fcontact">
          📞 <a href="tel:+919972135467">+91 99721 35467</a> · <a href="tel:+919606975325">+91 96069 75325</a> · <a href="tel:+918050266702">+91 80502 66702</a>
          <br />
          ✉️ <a href="mailto:gm@jupiterinfotech.co.in">gm@jupiterinfotech.co.in</a> · <a href="mailto:manager@jupiterinfotech.co.in">manager@jupiterinfotech.co.in</a>
        </div>
        <div className="fcopy">© 2026 Jupiter Infotech · Bangalore | Gulbarga | Karnataka</div>
      </div>
    </footer>
  );
}
