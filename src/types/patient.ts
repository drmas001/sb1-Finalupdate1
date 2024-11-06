export interface Patient {
  mrn: string;
  patient_name: string;
  age: number;
  gender: string;
  assigned_doctor: string;
  specialty: string;
  diagnosis: string;
  type: 'Admission' | 'Consultation';
}