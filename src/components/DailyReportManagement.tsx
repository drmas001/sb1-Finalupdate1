import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, FileText } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import { specialtiesList } from '../constants/specialties';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

interface Patient {
  mrn: string;
  patient_name: string;
  age: number;
  gender: string;
  admission_date: string;
  specialty: string;
  patient_status: string;
  diagnosis: string;
  updated_at: string;
}

interface Consultation {
  mrn: string;
  patient_name: string;
  age: number;
  gender: string;
  created_at: string;
  consultation_specialty: string;
  status: string;
  requesting_department: string;
  updated_at: string;
}

interface DailyReport {
  report_id: string;
  patient_id: string;
  report_date: string;
  report_content: string;
  created_at: string;
  patients: {
    patient_name: string;
    mrn: string;
  };
}

interface Appointment {
  appointment_id: string;
  patient_name: string;
  patient_medical_number: string;
  clinic_specialty: string;
  appointment_type: 'Urgent' | 'Regular';
  notes: string;
  created_at: string;
}

const styles = StyleSheet.create({
  page: { 
    padding: 30,
    backgroundColor: '#ffffff'
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10
  },
  title: { 
    fontSize: 24,
    marginBottom: 5,
    color: '#1e40af',
    textAlign: 'center'
  },
  subtitle: { 
    fontSize: 12,
    marginBottom: 3,
    color: '#4b5563',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 10,
    color: '#1e40af',
    paddingBottom: 5
  },
  table: { 
    display: 'table',
    width: 'auto',
    marginVertical: 10,
    marginBottom: 20
  },
  tableRow: { 
    margin: 'auto',
    flexDirection: 'row',
    minHeight: 25
  },
  tableHeader: {
    backgroundColor: '#f3f4f6'
  },
  tableCell: {
    width: '20%',
    padding: 6,
    fontSize: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  tableCellHeader: {
    width: '20%',
    padding: 6,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e40af',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 8,
    paddingTop: 10
  }
});

const MyDocument: React.FC<{
  patients: (Patient | Consultation)[];
  appointments: Appointment[];
  selectedDate: string;
  selectedSpecialty: string;
}> = ({ patients, appointments, selectedDate, selectedSpecialty }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Patient Report</Text>
        <Text style={styles.subtitle}>Date: {selectedDate}</Text>
        {selectedSpecialty && (
          <Text style={styles.subtitle}>Specialty: {selectedSpecialty}</Text>
        )}
      </View>
      
      <Text style={styles.sectionTitle}>Patients and Consultations</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={styles.tableCellHeader}><Text>MRN</Text></View>
          <View style={styles.tableCellHeader}><Text>Patient Name</Text></View>
          <View style={styles.tableCellHeader}><Text>Age/Gender</Text></View>
          <View style={styles.tableCellHeader}><Text>Specialty</Text></View>
          <View style={styles.tableCellHeader}><Text>Diagnosis/Department</Text></View>
        </View>
        {patients.map((patient, index) => (
          <View style={styles.tableRow} key={`${patient.mrn}-${index}`}>
            <View style={styles.tableCell}><Text>{patient.mrn}</Text></View>
            <View style={styles.tableCell}><Text>{patient.patient_name}</Text></View>
            <View style={styles.tableCell}>
              <Text>{patient.age} / {patient.gender}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>
                {(patient as Patient).specialty || (patient as Consultation).consultation_specialty}
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text>
                {(patient as Patient).diagnosis || (patient as Consultation).requesting_department}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Appointments</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={styles.tableCellHeader}><Text>Patient Name</Text></View>
          <View style={styles.tableCellHeader}><Text>Medical Number</Text></View>
          <View style={styles.tableCellHeader}><Text>Specialty</Text></View>
          <View style={styles.tableCellHeader}><Text>Type</Text></View>
          <View style={styles.tableCellHeader}><Text>Notes</Text></View>
        </View>
        {appointments.map((appointment, index) => (
          <View style={styles.tableRow} key={`${appointment.appointment_id}-${index}`}>
            <View style={styles.tableCell}><Text>{appointment.patient_name}</Text></View>
            <View style={styles.tableCell}><Text>{appointment.patient_medical_number}</Text></View>
            <View style={styles.tableCell}><Text>{appointment.clinic_specialty}</Text></View>
            <View style={styles.tableCell}><Text>{appointment.appointment_type}</Text></View>
            <View style={styles.tableCell}><Text>{appointment.notes}</Text></View>
          </View>
        ))}
      </View>
      
      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleString()}</Text>
      </View>
    </Page>
  </Document>
);

const DailyReportManagement: React.FC = () => {
  const [patients, setPatients] = useState<(Patient | Consultation)[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<(Patient | Consultation)[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
    fetchDailyReports();
  }, [selectedDate]);

  useEffect(() => {
    filterPatients();
  }, [selectedDate, selectedSpecialty, patients]);

  const fetchDailyReports = async () => {
    try {
      const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_reports')
        .select(`
          report_id,
          patient_id,
          report_date,
          report_content,
          created_at,
          patients (
            patient_name,
            mrn
          )
        `)
        .eq('report_date', formattedDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDailyReports(data || []);
    } catch (error) {
      console.error('Error fetching daily reports:', error);
      toast.error('Failed to fetch daily reports');
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .gte('admission_date', startDate.toISOString())
        .lte('admission_date', endDate.toISOString())
        .order('admission_date', { ascending: false });

      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (patientsError) throw patientsError;
      if (consultationsError) throw consultationsError;

      const combinedData = [
        ...(patientsData || []),
        ...(consultationsData || [])
      ];

      setPatients(combinedData);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('clinic_appointments')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    if (selectedSpecialty) {
      filtered = filtered.filter(patient => 
        (patient as Patient).specialty === selectedSpecialty || 
        (patient as Consultation).consultation_specialty === selectedSpecialty
      );
    }

    setFilteredPatients(filtered);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Daily Report Management</h1>
        
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
          <div className="flex items-center mb-2 sm:mb-0 sm:mr-4">
            <Calendar className="mr-2 h-5 w-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-gray-500" />
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">All Specialties</option>
              {specialtiesList.map((specialty) => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <PDFDownloadLink
            document={
              <MyDocument 
                patients={filteredPatients}
                appointments={appointments}
                selectedDate={selectedDate}
                selectedSpecialty={selectedSpecialty}
              />
            }
            fileName={`daily_report_${selectedDate}${selectedSpecialty ? `_${selectedSpecialty}` : ''}.pdf`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {({ loading }) => (
              <>
                <Download className="mr-2 h-5 w-5" />
                {loading ? 'Generating PDF...' : 'Download PDF Report'}
              </>
            )}
          </PDFDownloadLink>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Active Patients and Consultations</h2>
          </div>
          <div className="border-t border-gray-200">
            {filteredPatients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRN</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Gender</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis/Department</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient, index) => (
                      <tr key={`${patient.mrn}-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.mrn}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.patient_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.age} / {patient.gender}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(patient as Patient).specialty || (patient as Consultation).consultation_specialty}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(patient as Patient).diagnosis || (patient as Consultation).requesting_department}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-6 py-4 text-sm text-gray-500">No patients found for the selected criteria.</p>
            )}
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Clinic Appointments</h2>
          </div>
          <div className="border-t border-gray-200">
            {appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medical Number</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment, index) => (
                      <tr key={`${appointment.appointment_id}-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.patient_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.patient_medical_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.clinic_specialty}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.appointment_type === 'Urgent' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {appointment.appointment_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-6 py-4 text-sm text-gray-500">No appointments found for the selected date.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReportManagement;