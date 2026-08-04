import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Star, Loader2, Plane, Plus, X, Calendar, Users, CheckCircle2, ShieldCheck, Edit3, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchPackages, createPackage, updatePackage, deletePackage, type Package } from '../api/packageApi';
import { createBooking } from '../api/bookingApi';

const Packages = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // User state
  const storedUser = localStorage.getItem('wanderers_user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isOperator = user?.role === 'OPERATOR';

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Package Form state
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [price, setPrice] = useState('');
  const [durationDays, setDurationDays] = useState('3');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Booking Form state
  const [travelDate, setTravelDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Queries
  const { data: packages, isLoading, isError } = useQuery({
    queryKey: ['packages'],
    queryFn: fetchPackages,
  });

  // Mutations
  const addPackageMutation = useMutation({
    mutationFn: createPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error || 'Failed to create package');
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: updatePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setEditingPackage(null);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error || 'Failed to update package');
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to delete package');
    },
  });

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      setBookingSuccess(true);
    },
    onError: (err: any) => {
      setBookingError(err.response?.data?.error || 'Failed to complete booking');
    },
  });

  const resetForm = () => {
    setTitle('');
    setDestination('');
    setPrice('');
    setDurationDays('3');
    setCoverImage('');
    setDescription('');
    setItinerary('');
    setFormError(null);
  };

  const handleOpenAddModal = () => {
    setEditingPackage(null);
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setTitle(pkg.title);
    setDestination(pkg.destination);
    setPrice(pkg.price.toString());
    setDurationDays(pkg.durationDays.toString());
    setCoverImage(pkg.coverImage || '');
    setDescription(pkg.description);
    setItinerary(pkg.itinerary);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const payload = {
      title,
      destination,
      price: parseFloat(price),
      durationDays: parseInt(durationDays),
      coverImage: coverImage || undefined,
      description,
      itinerary,
    };

    if (editingPackage) {
      updatePackageMutation.mutate({
        id: editingPackage.id,
        data: payload,
      });
    } else {
      addPackageMutation.mutate(payload);
    }
  };

  const handleDeleteClick = (id: number) => {
    if (window.confirm('Are you sure you want to delete this tour package?')) {
      deletePackageMutation.mutate(id);
    }
  };

  const handleBookClick = (pkg: Package) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedPackage(pkg);
    setBookingSuccess(false);
    setBookingError(null);
    setTravelDate('');
    setPassengers(1);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !travelDate) return;
    setBookingError(null);
    bookingMutation.mutate({
      packageId: selectedPackage.id,
      travelDate,
      passengers,
      totalAmount: selectedPackage.price * passengers,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading incredible destinations...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-red-500">
        <p>Failed to load packages. Please try again later.</p>
      </div>
    );
  }

  const displayPackages = packages || [];

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Explore Packages</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Find the perfect getaway from verified tour companies.
          </p>
        </div>

        {isOperator && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/25 transition-all self-start md:self-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Package</span>
          </button>
        )}
      </div>

      {/* Package Grid */}
      {displayPackages.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <Plane className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">No packages listed yet!</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            {isOperator
              ? 'Click the "Add New Package" button above to publish your first tour package!'
              : 'Check back soon for amazing adventures from verified operators.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPackages.map((pkg: Package, i: number) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col hover:shadow-xl transition-all duration-300 relative"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={
                    pkg.coverImage ||
                    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center shadow-sm">
                  <Star className="w-3.5 h-3.5 text-yellow-500 mr-1 fill-yellow-500" />
                  4.9
                </div>
                {pkg.company?.name && (
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-medium flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>{pkg.company.name}</span>
                  </div>
                )}

                {/* Operator Actions: Edit & Delete buttons */}
                {isOperator && (
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(pkg)}
                      title="Edit Package"
                      className="p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-200 rounded-full shadow-md hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(pkg.id)}
                      title="Delete Package"
                      className="p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-red-600 rounded-full shadow-md hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2 line-clamp-1">{pkg.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                  {pkg.description}
                </p>
                <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs mb-6 space-x-4">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-blue-500" /> {pkg.destination}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-blue-500" /> {pkg.durationDays} Days
                  </span>
                </div>
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-slate-400">Starting from</p>
                    <p className="text-2xl font-bold text-blue-600">${pkg.price}</p>
                  </div>
                  <button
                    onClick={() => handleBookClick(pkg)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-blue-500/20 transition-all text-sm"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal 1: Add/Edit Package (Operator Only) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingPackage ? 'Edit Tour Package' : 'Add Tour Package'}
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Package Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Swiss Alps Explorer"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Destination</label>
                    <input
                      type="text"
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Interlaken, Switzerland"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Price ($ USD)</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="1499"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Duration (Days)</label>
                    <input
                      type="number"
                      required
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Cover Image URL</label>
                    <input
                      type="url"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
                  <textarea
                    required
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief summary of the experience..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Itinerary Details</label>
                  <textarea
                    required
                    rows={3}
                    value={itinerary}
                    onChange={(e) => setItinerary(e.target.value)}
                    placeholder="Day 1: Arrival, Day 2: City tour..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={addPackageMutation.isPending || updatePackageMutation.isPending}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 mt-4"
                >
                  {addPackageMutation.isPending || updatePackageMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>{editingPackage ? 'Save Changes' : 'Publish Package'}</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Book Package */}
      <AnimatePresence>
        {selectedPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Book Tour</h2>
                <button
                  onClick={() => setSelectedPackage(null)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                  <h3 className="text-2xl font-bold">Booking Confirmed!</h3>
                  <p className="text-slate-500 text-sm">
                    Your booking request for <strong>{selectedPackage.title}</strong> has been placed.
                    The tour operator will confirm your itinerary.
                  </p>
                  <button
                    onClick={() => setSelectedPackage(null)}
                    className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl mt-4"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center space-x-4">
                    <img
                      src={selectedPackage.coverImage || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c'}
                      alt={selectedPackage.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-sm line-clamp-1">{selectedPackage.title}</h4>
                      <p className="text-xs text-slate-400">{selectedPackage.destination}</p>
                      <p className="text-blue-600 font-bold text-sm mt-1">
                        ${selectedPackage.price} / person
                      </p>
                    </div>
                  </div>

                  {bookingError && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                      {bookingError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1 flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-blue-500" /> Travel Date
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1 flex items-center">
                      <Users className="w-4 h-4 mr-1 text-blue-500" /> Number of Passengers
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={passengers}
                      onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex justify-between items-center border border-blue-100 dark:border-blue-900/50 mt-4">
                    <div>
                      <p className="text-xs text-slate-500">Total Price</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${selectedPackage.price * passengers}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      ({passengers} traveler{passengers > 1 ? 's' : ''})
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingMutation.isPending}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 mt-4"
                  >
                    {bookingMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span>Confirm Booking</span>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Packages;
