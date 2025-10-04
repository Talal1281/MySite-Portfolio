const cursor = document.createElement('div');
cursor.className = 'cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX - 10 + 'px';
    cursor.style.top = e.clientY - 10 + 'px';
});

document.addEventListener('mousedown', () => {
    cursor.style.transform = 'scale(0.8)';
});

document.addEventListener('mouseup', () => {
    cursor.style.transform = 'scale(1)';
});

const statusIndicator = document.querySelector('.status-indicator');
let lastScrollTop = 0;
let scrollTimeout;
let isScrolling = false;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    clearTimeout(scrollTimeout);
    
    if (currentScroll > lastScrollTop && currentScroll > 100) {
        statusIndicator.classList.add('scroll-collapsed');
    } else if (currentScroll < lastScrollTop) {
        statusIndicator.classList.remove('scroll-collapsed');
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    
    if (!isScrolling) {
        isScrolling = true;
    }
    
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        if (currentScroll > 100) {
            statusIndicator.classList.add('scroll-collapsed');
        }
    }, 150);
});

const interactiveElements = document.querySelectorAll('a, button, .card, .hero-content, .summary, .education-content, .training-content, .project-card, .skill-card, training-card');
interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursor.classList.add('hovered');
    });
    element.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovered');
    });
});

const cards = document.querySelectorAll('.card');
cards.forEach(card => {
    const header = card.querySelector('.card-header');
    const details = card.querySelector('.card-details');
    const toggle = card.querySelector('.card-toggle');

    header.addEventListener('click', () => {
        const isActive = details.classList.contains('active');
        
        cards.forEach(otherCard => {
            if (otherCard !== card) {
                const otherDetails = otherCard.querySelector('.card-details');
                const otherToggle = otherCard.querySelector('.card-toggle');
                if (otherDetails.classList.contains('active')) {
                    otherDetails.style.maxHeight = otherDetails.scrollHeight + 'px';
                    otherDetails.offsetHeight;
                    otherDetails.classList.remove('active');
                    otherDetails.style.maxHeight = '0';
                    otherToggle.classList.remove('active');
                }
            }
        });

        if (isActive) {
            details.style.maxHeight = details.scrollHeight + 'px';
            details.offsetHeight;
            details.classList.remove('active');
            details.style.maxHeight = '0';
            toggle.classList.remove('active');
        } else {
            details.style.maxHeight = '0';
            details.classList.add('active');
            details.style.maxHeight = details.scrollHeight + 'px';
            toggle.classList.add('active');
        }
    });
});

const observerOptions = {
    root: null,
    rootMargin: '-50px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            requestAnimationFrame(() => {
                entry.target.classList.add('reveal');
                if (entry.target.classList.contains('card') || 
                    entry.target.classList.contains('education-content') || 
                    entry.target.classList.contains('training-content')) {
                    entry.target.addEventListener('mouseenter', () => {
                        entry.target.style.transform = 'translateY(-10px)';
                    });
                    entry.target.addEventListener('mouseleave', () => {
                        entry.target.style.transform = 'translateY(0)';
                        entry.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
                    });
                }
            });
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.card, .education-content, .training-content, .summary').forEach(element => {
    observer.observe(element);
});

document.querySelectorAll('.training-card').forEach(element => {
    observer.observe(element);
});

const projectsCarousel = document.querySelector('.projects-cards-row');
const projectCards = document.querySelectorAll('.projects-cards-row .project-card');
const totalProjectCards = projectCards.length;
let currentProjectIndex = 0;
let isProjectScrolling = false;
const projectScrollCooldown = 600;

function updateProjectCarousel() {
    const angleStep = 20;
    const translateXStep = 450;
    const translateZStep = 80;
    const scaleStep = 0.05;

    projectCards.forEach((card, index) => {
        let relativeIndex = index - currentProjectIndex;
        if (relativeIndex < -Math.floor(totalProjectCards / 2)) {
            relativeIndex += totalProjectCards;
        } else if (relativeIndex > Math.floor(totalProjectCards / 2)) {
            relativeIndex -= totalProjectCards;
        }

        const angle = relativeIndex * angleStep;
        const translateX = relativeIndex * translateXStep;
        const translateZ = -Math.abs(relativeIndex) * translateZStep;
        
        const opacity = 1 - Math.min(1, Math.abs(relativeIndex) * 0.3);
        const scale = 1 - Math.min(0.5, Math.abs(relativeIndex) * scaleStep);

        const pointerEvents = relativeIndex === 0 ? 'auto' : 'none';

        card.style.transform = `translateX(${translateX}px) rotateY(${angle}deg) translateZ(${translateZ}px) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.zIndex = totalProjectCards - Math.abs(relativeIndex);
        card.style.pointerEvents = pointerEvents;
    });
}

function handleProjectScroll(direction) {
    if (isProjectScrolling) return;
    isProjectScrolling = true;

    if (direction > 0) {
        currentProjectIndex = (currentProjectIndex + 1) % totalProjectCards;
    } else if (direction < 0) {
        currentProjectIndex = (currentProjectIndex - 1 + totalProjectCards) % totalProjectCards;
    }

    updateProjectCarousel();

    setTimeout(() => {
        isProjectScrolling = false;
    }, projectScrollCooldown);
}

if (projectsCarousel) {
    projectsCarousel.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (isProjectScrolling) return;
        const delta = e.deltaX || e.deltaY;
        handleProjectScroll(delta);
    });
}

if (projectsCarousel && typeof Hammer !== 'undefined') {
    const hammerProjects = new Hammer(projectsCarousel);
    hammerProjects.on('swipeleft swiperight', function(e) {
        if (isProjectScrolling) return;
        if (e.direction === Hammer.DIRECTION_LEFT) {
            handleProjectScroll(1);
        } else if (e.direction === Hammer.DIRECTION_RIGHT) {
            handleProjectScroll(-1);
        }
    });
}

updateProjectCarousel();

const navLinks = document.querySelectorAll('nav a');
let currentSection = '';

function updateActiveNav() {
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            if (currentSection !== sectionId) {
                currentSection = sectionId;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateY(-4px) scale(1.1)';
    });
    
    link.addEventListener('mouseleave', () => {
        if (!link.classList.contains('active')) {
            link.style.transform = 'translateY(0) scale(1)';
        }
    });
});

let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

const userTimeDiv = document.getElementById('user-time');

function startClock() {
    function updateClock() {
        const now = new Date();
        const hour = now.getHours();
        
        // Add emoji based on time
        let emoji = "🕒";
        if (hour >= 5 && hour < 12) emoji = "🌅 ";      // Morning
        else if (hour >= 12 && hour < 18) emoji = "🌞 "; // Afternoon
        else if (hour >= 18 || hour < 5) emoji = "🌙 ";  // Night
        
        const weekday = now.toLocaleDateString('en-US', { weekday: 'short' });
        let timeString = '';
        try {
            const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
            timeString = now.toLocaleTimeString('en-US', options);
        } catch {
            timeString = now.toLocaleTimeString('en-US', { hour12: true });
        }
        if (userTimeDiv) {
            userTimeDiv.textContent = `${emoji} ${weekday} ${timeString}`;
        }
    }
    updateClock();
    setInterval(updateClock, 1000);
}

startClock();

const batteryIndicator = document.getElementById('battery-indicator');
const batteryBar = batteryIndicator.querySelector('.battery-bar');
const batteryLevel = batteryBar.querySelector('.battery-level');
const batteryPercentage = batteryIndicator.querySelector('.battery-percentage');

function updateBatteryIndicator() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const level = battery.level * 100;
            batteryLevel.style.width = `${level}%`;
            batteryPercentage.textContent = `${Math.round(level)}%`;
            
            batteryLevel.classList.remove('low', 'medium', 'high');
            if (level <= 20) {
                batteryLevel.classList.add('low');
            } else if (level <= 50) {
                batteryLevel.classList.add('medium');
            } else {
                batteryLevel.classList.add('high');
            }
            
            if (battery.charging) {
                batteryLevel.classList.add('charging');
            } else {
                batteryLevel.classList.remove('charging');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                const chunks = entry.target.querySelectorAll('.story-chunk');
                chunks.forEach(chunk => {
                    setTimeout(() => chunk.classList.add('reveal'), parseFloat(chunk.dataset.delay) * 1000);
                });
                aboutObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.about-card').forEach(el => {
        aboutObserver.observe(el);
    });

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const avatar = document.querySelector('.about-avatar');
        if (avatar) {
            const rate = scrolled * -0.5;
            avatar.style.transform = `translateY(${rate}px)`;
        }
    });

    const storyChunks = document.querySelectorAll('.story-chunk');
    storyChunks.forEach(chunk => {
        chunk.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
        });
        chunk.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.courses-section .tab-btn');
    const tabPanes = document.querySelectorAll('.courses-section .tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                pane.style.opacity = '0';
            });
            
            this.classList.add('active');
            
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId + '-tab');
            if (tabContent) {
                tabContent.classList.add('active');
                setTimeout(() => {
                    tabContent.style.opacity = '1';
                }, 50);
            }
        });
    });
    
    const firstTab = document.querySelector('.courses-section .tab-btn.active');
    if (firstTab) {
        const tabId = firstTab.getAttribute('data-tab');
        const tabContent = document.getElementById(tabId + '-tab');
        if (tabContent) {
            tabContent.style.opacity = '1';
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const skillCardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                skillCardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.13 });

    document.querySelectorAll('.skill-card').forEach((el, i) => {
        el.style.transitionDelay = (i * 0.09) + 's';
        skillCardObserver.observe(el);
    });
});

const skillsObserverBoxes = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
            skillsObserverBoxes.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15
});

document.querySelectorAll('.skill-box').forEach(box => {
    skillsObserverBoxes.observe(box);
});

//const express = require('express');
//const fs = require('fs');
//const nodemailer = require('nodemailer');
//const cron = require('node-cron');
//
//const app = express();
//const PORT = 3000;
//
//// Log incoming IPs
//app.get('/', (req, res) => {
//    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//    console.log(`New visit from: ${ip}`);
//    fs.appendFileSync('ip-log.txt', `${new Date().toISOString()} - ${ip}\n`);
//    res.send('Welcome!');
//});
//
//app.listen(PORT, () => {
//    console.log(`Server running on port ${PORT}`);
//});
//
//// Run every minute for testing (change back to weekly later)
//cron.schedule('* * * * *', () => {
//    console.log('Running scheduled email task...');
//    const ipData = fs.readFileSync('ip-log.txt', 'utf-8');
//
//    const transporter = nodemailer.createTransport({
//        service: 'gmail',
//        auth: {
//            user: 'eren.ali1281@gmail.com',      // <-- replace with your Gmail
//            pass: 'saskue128'      // <-- use Gmail app password, NOT regular password
//        }
//    });
//
//    const mailOptions = {
//        from: 'eren.ali1281@gmail.com',
//        to: 'eren.ali1281@gmail.com',
//        subject: 'IP Report (Test Run)',
//        text: `Here are the logged IPs:\n\n${ipData}`
//    };
//
//    transporter.sendMail(mailOptions, (error, info) => {
//        if (error) {
//            console.error('Error sending email:', error);
//        } else {
//            console.log('Email sent:', info.response);
//        }
//    });
//});
//



