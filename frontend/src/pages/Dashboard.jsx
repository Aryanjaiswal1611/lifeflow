import { useAuth } from '../context/AuthContext';
import DonorDashboard from '../components/donor/DonorDashboard';
import ReceiverDashboard from '../components/receiver/ReceiverDashboard';
import AdminDashboard from '../components/admin/AdminDashboard';
import HospitalDashboard from '../components/hospital/HospitalDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  const dashboards = {
    donor: DonorDashboard,
    receiver: ReceiverDashboard,
    admin: AdminDashboard,
    hospital: HospitalDashboard
  };

  const Component = dashboards[user?.role];
  return Component ? <Component /> : <div className="p-8 text-center">Dashboard not available for your role.</div>;
};

export default Dashboard;
