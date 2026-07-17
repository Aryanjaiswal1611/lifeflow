const Blog = require('../models/Blog');

const seedBlogs = async () => {
  const count = await Blog.countDocuments();
  if (count > 0) return false;

  const sampleBlogs = [
    {
      title: 'The Life-Changing Benefits of Regular Blood Donation',
      slug: 'benefits-of-regular-blood-donation',
      content: `<p>Blood donation is one of the simplest yet most impactful ways to save lives. Every two seconds, someone in need requires a blood transfusion. By donating blood regularly, you become part of a life-saving chain that keeps our healthcare system functioning.</p><h2>Health Benefits for Donors</h2><p>Regular blood donation offers several health benefits. It helps reduce iron levels in the body, which can lower the risk of heart disease and liver conditions. The pre-donation health screening also provides a free mini-health checkup, checking your blood pressure, hemoglobin levels, and pulse.</p><h2>Community Impact</h2><p>A single donation can save up to three lives. Your blood is separated into red blood cells, platelets, and plasma, each serving different medical needs. Accident victims, surgery patients, cancer patients undergoing chemotherapy, and individuals with blood disorders all depend on donated blood.</p><h2>How Often Can You Donate?</h2><p>Whole blood can be donated every 56 days (8 weeks). Platelet donations can be made more frequently — every 7 days, up to 24 times per year. Plasma can be donated every 28 days.</p><p>By making blood donation a regular habit, you ensure that blood banks maintain adequate supplies for emergencies. Your consistent contribution makes our community healthier and more resilient.</p>`,
      excerpt: 'Discover the incredible health benefits and life-saving impact of donating blood regularly. Learn how one donation can save multiple lives.',
      category: 'Blood Donation',
      author: 'Dr. Arjun Sharma',
      tags: ['blood donation', 'health benefits', 'regular donor', 'save lives'],
      readingTime: 6,
      published: true
    },
    {
      title: 'Who Can Donate Blood? A Complete Eligibility Guide',
      slug: 'who-can-donate-blood-guide',
      content: `<p>Blood donation eligibility criteria exist to protect both the donor and the recipient. Understanding these requirements helps ensure a safe and successful donation experience.</p><h2>Basic Requirements</h2><ul><li>Age: 18–65 years (some states allow 16–17 with parental consent)</li><li>Weight: Minimum 50 kg (110 lbs)</li><li>Overall health: Must be feeling well on donation day</li></ul><h2>Medical Conditions</h2><p>Most chronic conditions like high blood pressure, diabetes, and asthma do not automatically disqualify you, provided they are well-managed. However, certain medications or recent surgeries may require a waiting period.</p><h2>Travel History</h2><p>Travel to certain countries with endemic diseases may require a deferral period. Always inform your donation center about recent international travel.</p><h2>Lifestyle Considerations</h2><p>Tattoos and piercings require a waiting period of 3–12 months depending on local regulations. Recent alcohol consumption may also affect eligibility.</p>`,
      excerpt: 'Complete guide to blood donation eligibility criteria including age, weight, medical conditions, travel history, and lifestyle factors.',
      category: 'Awareness',
      author: 'LifeFlow Medical Team',
      tags: ['eligibility', 'who can donate', 'requirements', 'donor criteria'],
      readingTime: 5,
      published: true
    },
    {
      title: 'Understanding Blood Group Compatibility',
      slug: 'blood-group-compatibility-guide',
      content: `<p>Blood type compatibility is crucial for safe blood transfusions. There are four main blood groups: A, B, AB, and O, each classified as Rh-positive or Rh-negative.</p><h2>The Eight Blood Types</h2><p>The eight common blood types are O−, O+, A−, A+, B−, B+, AB−, and AB+. Each has unique compatibility characteristics.</p><h2>Universal Donors and Recipients</h2><p>Type O− is the universal donor — anyone can receive O− blood in emergencies. Type AB+ is the universal recipient — they can receive blood from any type. These special groups are critically important in emergency medicine.</p><h2>Compatibility Rules</h2><p>Blood type compatibility follows specific rules based on antigens and antibodies present in the blood. A person with Type A blood can receive A or O blood. Type B can receive B or O. Type AB can receive any type. Type O can only receive O.</p><p>Understanding your blood type and its compatibility can help you be better prepared for emergencies and medical procedures.</p>`,
      excerpt: 'A comprehensive guide to blood types, compatibility rules, universal donors, and why matching matters in transfusions.',
      category: 'Awareness',
      author: 'Dr. Priya Patel',
      tags: ['blood groups', 'compatibility', 'blood types', 'universal donor'],
      readingTime: 7,
      published: true
    },
    {
      title: 'Common Myths About Blood Donation Debunked',
      slug: 'myths-about-blood-donation',
      content: `<p>Despite decades of medical advancement, many myths about blood donation persist. Let's separate fact from fiction and address the most common misconceptions.</p><h2>Myth 1: Donating Blood is Painful</h2><p>The discomfort is minimal — most donors describe it as a quick pinch. The entire process takes about 10–15 minutes, and the sense of fulfillment far outweighs any temporary discomfort.</p><h2>Myth 2: You Can Get Diseases from Donating</h2><p>This is completely false. All equipment used is sterile, single-use, and disposable. There is zero risk of contracting any disease from donating blood.</p><h2>Myth 3: Donating Blood Weakens Your Immune System</h2><p>Your body quickly replenishes the donated blood. Within 24–48 hours, your blood volume returns to normal. Red blood cells are fully replaced within 4–8 weeks.</p><h2>Myth 4: You Can't Donate if You Have a Tattoo</h2><p>This depends on local regulations. In most places, you can donate 3–12 months after getting a tattoo, provided it was done at a licensed facility.</p><h2>Myth 5: Older People Cannot Donate</h2><p>As long as you are in good health and within the age limit (usually up to 65), age alone does not prevent you from donating. Many regular donors continue well into their 60s.</p>`,
      excerpt: 'Separating fact from fiction: common myths about blood donation debunked by medical experts.',
      category: 'Awareness',
      author: 'Nurse Anita Verma',
      tags: ['myths', 'facts', 'misconceptions', 'myth busting'],
      readingTime: 5,
      published: true
    },
    {
      title: 'How to Prepare Before Donating Blood',
      slug: 'preparing-before-blood-donation',
      content: `<p>Proper preparation ensures a smooth and comfortable blood donation experience. Follow these steps to be ready for your donation.</p><h2>The Day Before</h2><p>Stay hydrated by drinking plenty of water. Avoid alcohol for at least 24 hours before donation. Eat iron-rich foods like spinach, beans, red meat, and fortified cereals. Get a good night's sleep — aim for 7–8 hours.</p><h2>The Day of Donation</h2><p>Eat a healthy meal but avoid fatty foods. Have breakfast or lunch before donating — never donate on an empty stomach. Drink extra water or juice. Wear comfortable clothing with sleeves that can be rolled up easily.</p><h2>What to Bring</h2><p>Bring a valid photo ID, your donor card if you have one, and a list of any medications you are currently taking.</p><h2>During the Process</h2><p>Relax and let the trained staff guide you. Inform them of any discomfort. The actual blood draw takes only 8–10 minutes for a standard unit.</p>`,
      excerpt: 'Step-by-step guide on how to prepare for a blood donation — from diet and hydration to what to bring on donation day.',
      category: 'Health Tips',
      author: 'LifeFlow Team',
      tags: ['preparation', 'before donation', 'tips', 'donor guide'],
      readingTime: 4,
      published: true
    },
    {
      title: 'Recovery and Aftercare Following Blood Donation',
      slug: 'recovery-after-blood-donation',
      content: `<p>Taking proper care after donating blood is essential for a quick recovery and ensures you're ready for your next donation.</p><h2>Immediate Aftercare</h2><p>Rest at the donation center for 10–15 minutes after donating. Enjoy the refreshments provided — juice and snacks help restore your energy. Keep the bandage on for at least 4–6 hours.</p><h2>For the Next 24 Hours</h2><p>Drink extra fluids to replenish your blood volume. Avoid strenuous exercise, heavy lifting, or prolonged standing. Do not consume alcohol for at least 24 hours. If you feel dizzy, lie down with your feet elevated.</p><h2>Ongoing Care</h2><p>Eat iron-rich foods to help your body replace red blood cells. Vitamin C helps with iron absorption, so pair iron-rich foods with citrus fruits. Monitor the donation site for any unusual bruising or swelling.</p><h2>When to Call a Doctor</h2><p>Contact a medical professional if you experience persistent dizziness, nausea, bleeding from the donation site, or signs of infection.</p>`,
      excerpt: 'Essential aftercare tips for a quick recovery after blood donation including diet, rest, and warning signs to watch for.',
      category: 'Health Tips',
      author: 'Dr. Meera Nair',
      tags: ['recovery', 'aftercare', 'post-donation', 'recovery tips'],
      readingTime: 4,
      published: true
    },
    {
      title: 'Why Blood Donation Camps Are Vital for Communities',
      slug: 'importance-of-blood-donation-camps',
      content: `<p>Blood donation camps serve as the backbone of community blood supply. These organized events make it convenient for donors to contribute and help maintain adequate blood bank inventories.</p><h2>Accessibility and Convenience</h2><p>Camps bring the donation process to local communities, reducing the need for donors to travel to blood banks. This convenience significantly increases participation rates.</p><h2>Emergency Preparedness</h2><p>Regular camps ensure blood banks maintain sufficient stocks for emergencies. During natural disasters or mass casualty events, these community-driven supplies become invaluable.</p><h2>Community Engagement</h2><p>Camps foster a culture of giving and social responsibility. They provide opportunities for community members to come together for a common cause, strengthening social bonds.</p><h2>Education and Awareness</h2><p>Each camp is also an opportunity to educate the public about blood donation, dispel myths, and encourage first-time donors to step forward.</p>`,
      excerpt: 'How blood donation camps strengthen communities, improve emergency preparedness, and make donating accessible for everyone.',
      category: 'Blood Camps',
      author: 'Rahul Deshmukh',
      tags: ['camps', 'community', 'blood drives', 'emergency preparedness'],
      readingTime: 5,
      published: true
    },
    {
      title: 'Emergency Blood Requests: How the System Works',
      slug: 'emergency-blood-requests-system',
      content: `<p>When an emergency blood request is triggered, a well-coordinated system springs into action to ensure patients receive the blood they need as quickly as possible.</p><h2>How Emergency Requests Work</h2><p>When a hospital identifies an urgent need for blood, an emergency request is broadcast to registered donors in the vicinity who have compatible blood types.</p><h2>Smart Matching Technology</h2><p>Modern blood donation platforms use smart matching algorithms to identify the most suitable donors based on blood type compatibility, location proximity, and donation history.</p><h2>Response and Coordination</h2><p>Donors receive instant notifications and can respond to indicate their availability. The system tracks responses and coordinates with the requesting hospital to manage the logistics.</p><h2>Time is Critical</h2><p>In emergency situations, every minute counts. Having a network of pre-screened, willing donors dramatically reduces the time between request and transfusion.</p>`,
      excerpt: 'Learn how emergency blood request systems work, from instant donor notifications to smart matching and logistics coordination.',
      category: 'Emergency Care',
      author: 'LifeFlow Technical Team',
      tags: ['emergency', 'urgent request', 'response system', 'notifications'],
      readingTime: 6,
      published: true
    },
    {
      title: 'Nutrition Tips for Blood Donors',
      slug: 'nutrition-for-blood-donors',
      content: `<p>Proper nutrition plays a crucial role in maintaining healthy blood for donation and supporting your body's recovery afterward.</p><h2>Iron-Rich Foods</h2><p>Include plenty of iron-rich foods in your diet: lean red meat, poultry, fish, leafy green vegetables (spinach, kale), beans and lentils, tofu, and fortified cereals. Pair these with vitamin C sources like oranges, tomatoes, and bell peppers to enhance iron absorption.</p><h2>Hydration</h2><p>Aim for 8–10 glasses of water daily, and increase your intake in the 24 hours before donation. Proper hydration makes veins more accessible and reduces the risk of dizziness.</p><h2>Foods to Avoid Before Donation</h2><p>Limit fatty foods, which can affect blood tests. Avoid alcohol for 24 hours before and after donation. Reduce caffeine intake on donation day.</p><h2>Post-Donation Nutrition</h2><p>After donating, replenish with a balanced meal containing protein, iron, and fluids. Good options include a spinach salad with grilled chicken, lentil soup, or a smoothie with berries and spinach.</p>`,
      excerpt: 'Essential nutrition advice for blood donors including iron-rich foods, hydration tips, and post-donation meal recommendations.',
      category: 'Nutrition',
      author: 'Dietitian Sneha Kapoor',
      tags: ['nutrition', 'diet', 'iron', 'hydration', 'recovery food'],
      readingTime: 5,
      published: true
    },
    {
      title: 'Inspiring Stories of Blood Donors Who Changed Lives',
      slug: 'success-stories-blood-donors',
      content: `<p>Behind every blood donation is a story of hope, courage, and humanity. Here are some remarkable stories from donors who have made a lasting impact.</p><h2>The 100-Donor Club</h2><p>Rajesh Mehta, a 58-year-old teacher from Delhi, has donated blood over 100 times since his first donation at age 20. 'Each time I donate, I know I'm giving someone a second chance at life,' he says. His dedication has inspired hundreds of his students to become regular donors.</p><h2>A Father's Promise</h2><p>When Ananya needed emergency blood during a complicated pregnancy, strangers came forward to help. Her husband Vikram was so moved that he became a regular donor and now organizes quarterly camps in their apartment complex.</p><h2>The Golden Blood Donor</h2><p>Type O-negative donors are known as 'universal donors.' Priya, one such donor, makes it her mission to respond to every emergency alert she receives. 'I carry a rare key that can unlock anyone's emergency. It's my responsibility to use it.'</p><h2>Generations of Giving</h2><p>The Sharma family has donated over 500 units collectively across three generations. Grandfather, father, and son now donate together at every camp.</p>`,
      excerpt: 'Real stories of ordinary people doing extraordinary things through blood donation. Be inspired by their selfless acts.',
      category: 'Success Stories',
      author: 'LifeFlow Stories Team',
      tags: ['success stories', 'inspiring', 'donor stories', 'real lives'],
      readingTime: 7,
      published: true
    },
    {
      title: 'The Science Behind Blood Donation: How Your Body Recovers',
      slug: 'science-behind-blood-donation',
      content: `<p>Have you ever wondered what happens inside your body when you donate blood? The human body is remarkably efficient at replenishing what it loses.</p><h2>Immediate Response</h2><p>Within minutes of donating, your body begins to restore blood volume by pulling fluid from your tissues. Your blood pressure normalizes quickly as your cardiovascular system adjusts.</p><h2>Plasma Recovery</h2><p>Plasma, the liquid component of blood, is fully restored within 24–48 hours. This is why you can donate plasma more frequently than whole blood.</p><h2>Red Blood Cell Regeneration</h2><p>Red blood cells take longer to replace — about 4–6 weeks. Your bone marrow ramps up production in response to the decreased oxygen-carrying capacity of your blood.</p><h2>Iron Stores</h2><p>Each donation removes about 200–250 mg of iron from your body. It takes about 8–12 weeks to fully replenish iron stores through diet. This is the primary reason for the 56-day gap between whole blood donations.</p>`,
      excerpt: 'Discover the fascinating science of how your body recovers after donating blood, from plasma restoration to red blood cell production.',
      category: 'Medical News',
      author: 'Dr. Vikram Joshi',
      tags: ['science', 'body recovery', 'physiology', 'medical process'],
      readingTime: 6,
      published: true
    },
    {
      title: 'Blood Donation During Pregnancy and Postpartum',
      slug: 'blood-donation-pregnancy-postpartum',
      content: `<p>While pregnant women cannot donate blood due to their own increased blood volume needs, the postpartum period offers an opportunity to give back once fully recovered.</p><h2>Why Pregnant Women Cannot Donate</h2><p>Pregnancy increases a woman's blood volume by 30–50%. Donating during this period could compromise both maternal and fetal health. Additionally, the body needs its iron stores for the developing baby.</p><h2>Postpartum Donation Eligibility</h2><p>Most blood banks require a waiting period of 6–9 months after delivery before donating. This allows your body to fully recover from pregnancy and childbirth, and ensures your iron levels have returned to normal.</p><h2>Special Considerations</h2><p>If you had complications during pregnancy or delivery, such as severe anemia or preeclampsia, your eligibility may be further delayed. Always consult with your healthcare provider before donating after pregnancy.</p>`,
      excerpt: 'Important information about blood donation guidelines during pregnancy and the postpartum recovery period for new mothers.',
      category: 'Health Tips',
      author: 'Dr. Lakshmi Iyer',
      tags: ['pregnancy', 'postpartum', 'women health', 'maternal health'],
      readingTime: 4,
      published: true
    },
    {
      title: 'How Blood Banks Manage Inventory and Demand',
      slug: 'blood-bank-inventory-management',
      content: `<p>Blood bank inventory management is a complex logistical challenge that requires careful planning and real-time monitoring to ensure adequate supply meets fluctuating demand.</p><h2>Inventory Rotation</h2><p>Blood components have limited shelf lives: red blood cells last 42 days, platelets only 5–7 days, and plasma can be frozen for up to one year. Blood banks use a first-in-first-out system to minimize waste.</p><h2>Demand Forecasting</h2><p>Blood banks analyze historical data, seasonal patterns, and local events to predict demand. They maintain minimum stock levels for each blood type, with extra reserves for emergencies.</p><h2>Type-Specific Challenges</h2><p>O-negative blood is always in high demand since it's the universal donor type for emergencies. AB plasma is also critical. Blood banks constantly work to maintain adequate supplies of these special types.</p><h2>Technology in Blood Banking</h2><p>Modern blood banks use sophisticated inventory management systems that integrate with hospital networks, donor databases, and emergency alert systems to optimize supply chains and reduce wastage.</p>`,
      excerpt: 'Behind the scenes of blood bank operations: how inventory is managed, demand is forecast, and supply meets need.',
      category: 'Medical News',
      author: 'LifeFlow Operations Team',
      tags: ['blood bank', 'inventory', 'supply chain', 'demand management'],
      readingTime: 5,
      published: true
    },
    {
      title: 'Tips for Organizing a Successful Blood Donation Camp',
      slug: 'organizing-successful-blood-donation-camp',
      content: `<p>Organizing a blood donation camp is a rewarding experience that can save hundreds of lives. Here's how to ensure your camp is successful.</p><h2>Planning and Logistics</h2><p>Start planning 4–6 weeks in advance. Choose a convenient date and location with adequate space for registration, screening, donation, and recovery areas. Coordinate with a local blood bank or hospital for medical staff and equipment.</p><h2>Promotion and Recruitment</h2><p>Use social media, local newspapers, community groups, and workplace communications to spread the word. Set a target number of donors and track registrations. Consider offering incentives like refreshments and donor certificates.</p><h2>Donor Experience</h2><p>Create a welcoming atmosphere with clear signage, comfortable seating, and refreshments. Have volunteers guide donors through each step. Provide entertainment or information materials during the waiting period.</p><h2>Follow-Up</h2><p>Thank all participants after the event. Share the results — how many units were collected and how many lives will be impacted. This encourages repeat participation in future camps.</p>`,
      excerpt: 'Practical tips for organizing a successful blood donation camp including planning, promotion, donor experience, and follow-up.',
      category: 'Blood Camps',
      author: 'Community Outreach Team',
      tags: ['organizing camps', 'volunteer', 'community event', 'planning'],
      readingTime: 6,
      published: true
    },
    {
      title: 'Blood Donation and Mental Health: The Helper\'s High',
      slug: 'blood-donation-mental-health',
      content: `<p>Beyond saving lives, blood donation offers surprising mental health benefits. The phenomenon known as 'helper's high' is real and measurable.</p><h2>The Science of Giving</h2><p>When you perform an act of kindness, your brain releases endorphins, dopamine, and oxytocin — chemicals associated with pleasure, reward, and social bonding. This natural 'high' can last for hours after donating.</p><h2>Reduced Stress and Anxiety</h2><p>Regular altruistic activities have been linked to lower cortisol levels and reduced symptoms of anxiety and depression. Knowing you've made a tangible difference in someone's life provides a deep sense of purpose and fulfillment.</p><h2>Community Connection</h2><p>Blood donation connects you with your community. Donation centers bring together people from all walks of life united by a common purpose. This social connection is a powerful antidote to loneliness and isolation.</p><h2>Building Resilience</h2><p>Regular donors often report increased emotional resilience. The act of facing a needle and giving something of yourself builds mental strength and a positive self-image.</p>`,
      excerpt: 'Discover the surprising mental health benefits of blood donation, from the helper\'s high to reduced stress and community connection.',
      category: 'Health Tips',
      author: 'Dr. Ananya Gupta',
      tags: ['mental health', 'helper high', 'wellness', 'psychology'],
      readingTime: 5,
      published: true
    }
  ];

  await Blog.insertMany(sampleBlogs);
  console.log(`Seeded ${sampleBlogs.length} sample blog posts`);
  return true;
};

module.exports = seedBlogs;
