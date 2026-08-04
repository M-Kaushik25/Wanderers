import { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Search, MessageSquare, ChevronDown, CheckCircle2 } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Booking & Travel',
    question: 'How do I book a tour package on Wanderers?',
    answer: 'Select a tour package from our Packages page, choose a travel date (today or future dates), specify the number of passengers, and click Confirm Booking. Your booking will be sent directly to the tour operator.',
  },
  {
    category: 'Booking & Travel',
    question: 'Can I select a past date for my travel?',
    answer: 'No, Wanderers strictly enforces date validation. All travel dates must be today or in the future to prevent invalid or expired reservations.',
  },
  {
    category: 'Operator Verification',
    question: 'Are all tour operators on Wanderers verified?',
    answer: 'Yes! Wanderers is a B2B2C marketplace where tour companies must submit valid GST identification and official operating licenses for Admin review before receiving a Verified Operator badge.',
  },
  {
    category: 'Payments & Refunds',
    question: 'How do payments and cancellations work?',
    answer: 'Payments are processed securely via platform escrow. Cancellations are subject to the specific tour operator policy detailed on the package page.',
  },
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isTicketSubmitted, setIsTicketSubmitted] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTicketSubmitted(true);
    setTimeout(() => {
      setIsTicketSubmitted(false);
      setTicketSubject('');
      setTicketMessage('');
    }, 4000);
  };

  return (
    <div className="space-y-10 py-4 max-w-4xl mx-auto">
      {/* Hero Banner */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl mb-2">
          <HelpCircle className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">How can we help you?</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
          Find quick answers to common questions about tour bookings, operator verifications, and travel policies.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto pt-2">
          <Search className="absolute left-4 top-5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search FAQs (e.g. date validation, verification, booking)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          />
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No matching help topics found.
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex justify-between items-center font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
              >
                <span className="flex items-center">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 mr-3">
                    {faq.category}
                  </span>
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                    openIndex === idx ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-5 pt-1 text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-slate-50 dark:border-slate-800">
                  {faq.answer}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Submit Support Ticket Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-7 h-7" />
          <div>
            <h3 className="text-2xl font-bold">Need Additional Assistance?</h3>
            <p className="text-blue-100 text-sm">Submit a support ticket to our 24/7 customer experience team.</p>
          </div>
        </div>

        {isTicketSubmitted ? (
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto" />
            <h4 className="font-bold text-lg">Ticket Submitted Successfully!</h4>
            <p className="text-xs text-blue-100">Our support team will respond to your registered email address shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleTicketSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-blue-100">Subject</label>
              <input
                type="text"
                required
                placeholder="Brief description of your issue"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-blue-100">Message</label>
              <textarea
                required
                rows={3}
                placeholder="Provide detailed information..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-sm transition-all shadow-md"
            >
              Submit Ticket
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;
