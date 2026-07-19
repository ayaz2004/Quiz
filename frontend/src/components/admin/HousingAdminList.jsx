import { useEffect, useState } from 'react';
import {
  getAdminHousingListings,
  moderateHousingListing,
  deleteHousingListing,
} from '../../utils/housingApi';
import { getListingTypeLabel, getGenderLabel } from '../../utils/housingUtils';
import LoadingSpinner from './LoadingSpinner';
import Pagination from './Pagination';
import { Building2, CheckCircle, XCircle, Trash2, Phone } from 'lucide-react';

const HousingAdminList = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await getAdminHousingListings(currentPage, 10, statusFilter);
      setListings(res.data?.listings || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch {
      showMessage('error', 'Failed to load housing listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [currentPage, statusFilter]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleModerate = async (id, status) => {
    try {
      await moderateHousingListing(id, status);
      showMessage('success', `Listing ${status}`);
      fetchListings();
    } catch {
      showMessage('error', 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      await deleteHousingListing(id);
      showMessage('success', 'Listing deleted');
      fetchListings();
    } catch {
      showMessage('error', 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-7 h-7 text-emerald-600" aria-hidden />
          Housing Listings
        </h2>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="pending_review">Pending review</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="filled">Filled</option>
          <option value="inactive">Inactive</option>
          <option value="all">All</option>
        </select>
      </div>

      {message.text && (
        <div
          className={`px-4 py-3 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : listings.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-12">No listings in this queue.</p>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm"
            >
              <div className="flex flex-wrap justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                      {getListingTypeLabel(listing.listingType)}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                      {getGenderLabel(listing.genderPreference)}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {listing.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{listing.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{listing.address}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" aria-hidden />
                    {listing.contactPhone}
                    {listing.user?.email && ` · ${listing.user.email}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 items-start">
                  {listing.status === 'pending_review' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleModerate(listing.id, 'active')}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                      >
                        <CheckCircle className="w-3.5 h-3.5" aria-hidden />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModerate(listing.id, 'rejected')}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold"
                      >
                        <XCircle className="w-3.5 h-3.5" aria-hidden />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(listing.id)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  );
};

export default HousingAdminList;
