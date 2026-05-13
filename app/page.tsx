'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  GraduationCap, 
  FileText, 
  Users, 
  UserX, 
  AlertTriangle, 
  MessageSquare, 
  Search, 
  RefreshCcw, 
  X,
  ChevronRight,
  MoreHorizontal,
  LayoutGrid,
  List,
  CheckCircle2,
  Calendar,
  ChevronDown,
  User,
  ArrowUpDown,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Fuse from 'fuse.js';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Student {
  id: number;
  name: string;
  initials?: string;
  class: string;
  responsible: string;
  phone: string;
  absences: number;
  consecutive: number;
  status: string;
  atestado_end_date?: string;
  observations?: string;
}

// Mock Data
const initialStudents: Student[] = [
  { id: 1, name: 'Alice Oliveira Santos', initials: 'AO', class: '1º Ano A', responsible: 'Ricardo Santos', phone: '5511912345678', absences: 5, consecutive: 2, status: 'Ausente' },
  { id: 2, name: 'Bruno Ferreira Lima', initials: 'BF', class: '1º Ano B', responsible: 'Sônia Lima', phone: '5511923456789', absences: 18, consecutive: 6, status: 'Crítico' },
  { id: 3, name: 'Carla Souza Mendes', initials: 'CS', class: '2º Ano A', responsible: 'Marcos Mendes', phone: '5521934567890', absences: 3, consecutive: 1, status: 'Presente' },
  { id: 4, name: 'Daniel Alves Rocha', initials: 'DA', class: '3º Ano A', responsible: 'Patrícia Rocha', phone: '(31) 94567-8901', absences: 25, consecutive: 12, status: 'Crítico' },
  { id: 5, name: 'Eduarda Costa Silva', initials: 'EC', class: '4º Ano B', responsible: 'Jorge Silva', phone: '(41) 95678-9012', absences: 8, consecutive: 4, status: 'Crítico' },
  { id: 6, name: 'Felipe Martins Gomes', initials: 'FM', class: '5º Ano A', responsible: 'Letícia Gomes', phone: '(51) 96789-0123', absences: 12, consecutive: 3, status: 'Crítico' },
  { id: 7, name: 'Giovanna Ribeiro Paz', initials: 'GR', class: '5º Ano B', responsible: 'Roberto Paz', phone: '(61) 97890-1234', absences: 2, consecutive: 0, status: 'Presente' },
  { id: 8, name: 'Henrique Almeida Luz', initials: 'HA', class: '6º Ano A', responsible: 'Fernanda Luz', phone: '(71) 98901-2345', absences: 30, consecutive: 15, status: 'Crítico' },
  { id: 9, name: 'Isabela Castro Neves', initials: 'IC', class: '7º Ano B', responsible: 'Cláudio Neves', phone: '(81) 99012-3456', absences: 6, consecutive: 2, status: 'Ausente' },
  { id: 10, name: 'João Vitor Barbosa', initials: 'JV', class: '8º Ano A', responsible: 'Mônica Barbosa', phone: '(91) 90123-4567', absences: 15, consecutive: 5, status: 'Crítico' },
  { id: 11, name: 'Kelly Cristina Dias', initials: 'KC', class: '9º Ano B', responsible: 'Sérgio Dias', phone: '(11) 91111-2222', absences: 4, consecutive: 1, status: 'Presente' },
  { id: 12, name: 'Leonardo Pires Vale', initials: 'LP', class: '1º Ano A', responsible: 'Beatriz Vale', phone: '(21) 92222-3333', absences: 22, consecutive: 10, status: 'Crítico' },
  { id: 13, name: 'Mariana Frota Lins', initials: 'MF', class: '2º Ano A', responsible: 'André Lins', phone: '(31) 93333-4444', absences: 7, consecutive: 3, status: 'Crítico' },
  { id: 14, name: 'Nicolas Teodoro Luz', initials: 'NT', class: '3º Ano A', responsible: 'Elaine Luz', phone: '(41) 94444-5555', absences: 1, consecutive: 0, status: 'Presente' },
  { id: 15, name: 'Olívia Ramos Faria', initials: 'OR', class: '4º Ano B', responsible: 'Gustavo Faria', phone: '(51) 95555-6666', absences: 19, consecutive: 8, status: 'Crítico' },
  { id: 16, name: 'Pedro Henrique Lima', initials: 'PH', class: '5º Ano A', responsible: 'Renata Lima', phone: '(61) 96666-7777', absences: 11, consecutive: 4, status: 'Crítico' },
  { id: 17, name: 'Queila Maria Cruz', initials: 'QM', class: '6º Ano A', responsible: 'Valter Cruz', phone: '(71) 97777-8888', absences: 5, consecutive: 2, status: 'Ausente' },
  { id: 18, name: 'Rafael Silveira Boas', initials: 'RS', class: '7º Ano B', responsible: 'Tânia Boas', phone: '(81) 98888-9999', absences: 28, consecutive: 14, status: 'Crítico' },
  { id: 19, name: 'Sara Nogueira Reis', initials: 'SN', class: '8º Ano A', responsible: 'Fábio Reis', phone: '(91) 99999-0000', absences: 3, consecutive: 1, status: 'Presente' },
  { id: 20, name: 'Thiago Braga Neto', initials: 'TB', class: '9º Ano B', responsible: 'Lúcia Neto', phone: '(11) 90000-1111', absences: 14, consecutive: 5, status: 'Crítico' },
  { id: 21, name: 'Ursula Viana Lima', initials: 'UV', class: '1º Ano B', responsible: 'Igor Viana', phone: '(21) 91212-3434', absences: 9, consecutive: 3, status: 'Crítico' },
  { id: 22, name: 'Vinícius Junior Paz', initials: 'VJ', class: '2º Ano A', responsible: 'Marta Paz', phone: '(31) 92323-4545', absences: 35, consecutive: 20, status: 'Crítico' },
  { id: 23, name: 'Wagner Moura Silva', initials: 'WM', class: '3º Ano A', responsible: 'Célia Silva', phone: '(41) 93434-5656', absences: 2, consecutive: 0, status: 'Presente' },
  { id: 24, name: 'Xuxa Meneghel Flor', initials: 'XM', class: '4º Ano B', responsible: 'Pelé Flor', phone: '(51) 94545-6767', absences: 16, consecutive: 7, status: 'Crítico' },
  { id: 25, name: 'Yuri Gagarin Estrela', initials: 'YE', class: '5º Ano B', responsible: 'Nasa Estrela', phone: '(61) 95656-7878', absences: 8, consecutive: 3, status: 'Crítico' },
  // 50 additional students with 'Presente' status
  { id: 26, name: 'Adriano Imperador', initials: 'AI', class: '1º Ano A', responsible: 'Zico Silva', phone: '(21) 99999-1111', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 27, name: 'Beatriz Souza', initials: 'BS', class: '1º Ano A', responsible: 'Ana Souza', phone: '(21) 99999-2222', absences: 1, consecutive: 0, status: 'Presente' },
  { id: 28, name: 'Caio Castro', initials: 'CC', class: '1º Ano B', responsible: 'Maria Castro', phone: '(21) 99999-3333', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 29, name: 'Davi Lucca', initials: 'DL', class: '1º Ano B', responsible: 'Neymar Jr', phone: '(21) 99999-4444', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 30, name: 'Eliana Dedinhos', initials: 'ED', class: '2º Ano A', responsible: 'Beija Flor', phone: '(21) 99999-5555', absences: 2, consecutive: 0, status: 'Presente' },
  { id: 31, name: 'Fabio Assunção', initials: 'FA', class: '2º Ano A', responsible: 'Gloria Pires', phone: '(21) 99999-6666', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 32, name: 'Gisele Bündchen', initials: 'GB', class: '3º Ano A', responsible: 'Tom Brady', phone: '(21) 99999-7777', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 33, name: 'Humberto Carrão', initials: 'HC', class: '3º Ano A', responsible: 'Lima Duarte', phone: '(21) 99999-8888', absences: 1, consecutive: 0, status: 'Presente' },
  { id: 34, name: 'Isis Valverde', initials: 'IV', class: '4º Ano B', responsible: 'Cauã Reymond', phone: '(21) 99999-9999', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 35, name: 'Juliana Paes', initials: 'JP', class: '4º Ano B', responsible: 'Rodrigo Lombardi', phone: '(21) 99999-0000', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 36, name: 'Klebber Toledo', initials: 'KT', class: '5º Ano A', responsible: 'Camila Queiroz', phone: '(21) 98888-1111', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 37, name: 'Luan Santana', initials: 'LS', class: '5º Ano A', responsible: 'Jade Magalhães', phone: '(21) 98888-2222', absences: 2, consecutive: 0, status: 'Presente' },
  { id: 38, name: 'Marina Ruy Barbosa', initials: 'MR', class: '5º Ano B', responsible: 'Tony Ramos', phone: '(21) 98888-3333', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 39, name: 'Neymar Santos', initials: 'NS', class: '5º Ano B', responsible: 'Neymar Pai', phone: '(21) 98888-4444', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 40, name: 'Oscar Schmidt', initials: 'OS', class: '6º Ano A', responsible: 'Hortência Marcari', phone: '(21) 98888-5555', absences: 1, consecutive: 0, status: 'Presente' },
  { id: 41, name: 'Paolla Oliveira', initials: 'PO', class: '6º Ano A', responsible: 'Diogo Nogueira', phone: '(21) 98888-6666', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 42, name: 'Quico Tesouro', initials: 'QT', class: '7º Ano B', responsible: 'Dona Florinda', phone: '(21) 98888-7777', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 43, name: 'Rodrigo Faro', initials: 'RF', class: '7º Ano B', responsible: 'Danilo Faro', phone: '(21) 98888-8888', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 44, name: 'Sabrina Sato', initials: 'SS', class: '8º Ano A', responsible: 'Duda Nagle', phone: '(21) 98888-9999', absences: 1, consecutive: 0, status: 'Presente' },
  { id: 45, name: 'Tais Araujo', initials: 'TA', class: '8º Ano A', responsible: 'Lazaro Ramos', phone: '(21) 98888-0000', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 46, name: 'Uellington Silva', initials: 'US', class: '9º Ano B', responsible: 'Vera Silva', phone: '(21) 97777-1111', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 47, name: 'Viviane Araujo', initials: 'VA', class: '9º Ano B', responsible: 'Belo Silva', phone: '(21) 97777-2222', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 48, name: 'Wendel Bezerra', initials: 'WB', class: '1º Ano A', responsible: 'Goku Silva', phone: '(21) 97777-3333', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 49, name: 'Ximbinha Guitar', initials: 'XG', class: '1º Ano B', responsible: 'Joelma Calypso', phone: '(21) 97777-4444', absences: 3, consecutive: 0, status: 'Presente' },
  { id: 50, name: 'Yudi Tamashiro', initials: 'YT', class: '2º Ano A', responsible: 'Priscilla Alcantara', phone: '(21) 97777-5555', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 51, name: 'Zeca Pagodinho', initials: 'ZP', class: '3º Ano A', responsible: 'Arlindo Cruz', phone: '(21) 97777-6666', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 52, name: 'Anitta Poderosa', initials: 'AP', class: '4º Ano B', responsible: 'Ludmilla Silva', phone: '(21) 97777-7777', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 53, name: 'Babu Santana', initials: 'BS', class: '5º Ano A', responsible: 'Thelma Assis', phone: '(21) 97777-8888', absences: 1, consecutive: 0, status: 'Presente' },
  { id: 54, name: 'Chico Moedas', initials: 'CM', class: '6º Ano A', responsible: 'Luisa Sonza', phone: '(21) 97777-9999', absences: 10, consecutive: 0, status: 'Presente' },
  { id: 55, name: 'Deborah Secco', initials: 'DS', class: '7º Ano B', responsible: 'Hugo Moura', phone: '(21) 97777-0000', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 56, name: 'Emilio Surita', initials: 'ES', class: '8º Ano A', responsible: 'Bola Silva', phone: '(21) 96666-1111', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 57, name: 'Fátima Bernardes', initials: 'FB', class: '9º Ano B', responsible: 'William Bonner', phone: '(21) 96666-2222', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 58, name: 'Gretchen Conga', initials: 'GC', class: '1º Ano A', responsible: 'Thammy Miranda', phone: '(21) 96666-3333', absences: 5, consecutive: 0, status: 'Presente' },
  { id: 59, name: 'Hulk Paraíba', initials: 'HP', class: '2º Ano A', responsible: 'Iran Angelo', phone: '(21) 96666-4444', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 60, name: 'Ivete Sangalo', initials: 'IS', class: '3º Ano A', responsible: 'Daniel Cady', phone: '(21) 96666-5555', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 61, name: 'Jojo Todynho', initials: 'JT', class: '4º Ano B', responsible: 'Lucas Souza', phone: '(21) 96666-6666', absences: 2, consecutive: 0, status: 'Presente' },
  { id: 62, name: 'Karol Conka', initials: 'KC', class: '5º Ano B', responsible: 'Bil Araujo', phone: '(21) 96666-7777', absences: 15, consecutive: 0, status: 'Presente' },
  { id: 63, name: 'Lázaro Ramos', initials: 'LR', class: '6º Ano A', responsible: 'Wagner Moura', phone: '(21) 96666-8888', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 64, name: 'Maisa Silva', initials: 'MS', class: '7º Ano B', responsible: 'Raul Gil', phone: '(21) 96666-9999', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 65, name: 'Nego do Borel', initials: 'NB', class: '8º Ano A', responsible: 'Duda Reis', phone: '(21) 96666-0000', absences: 8, consecutive: 0, status: 'Presente' },
  { id: 66, name: 'Otaviano Costa', initials: 'OC', class: '9º Ano B', responsible: 'Flavia Alessandra', phone: '(21) 95555-1111', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 67, name: 'Preta Gil', initials: 'PG', class: '1º Ano B', responsible: 'Gilberto Gil', phone: '(21) 95555-2222', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 68, name: 'Ronaldo Fenômeno', initials: 'RF', class: '2º Ano A', responsible: 'Celina Locks', phone: '(21) 95555-3333', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 69, name: 'Susana Vieira', initials: 'SV', class: '3º Ano A', responsible: 'Sandro Pedroso', phone: '(21) 95555-4444', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 70, name: 'Tiririca Silva', initials: 'TS', class: '4º Ano B', responsible: 'Tirullipa Silva', phone: '(21) 95555-5555', absences: 12, consecutive: 0, status: 'Presente' },
  { id: 71, name: 'Vampeta Velho', initials: 'VV', class: '5º Ano A', responsible: 'Edilson Capetinha', phone: '(21) 95555-6666', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 72, name: 'Whindersson Nunes', initials: 'WN', class: '6º Ano A', responsible: 'Luisa Sonza', phone: '(21) 95555-7777', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 73, name: 'Xande de Pilares', initials: 'XP', class: '7º Ano B', responsible: 'Revelação Silva', phone: '(21) 95555-8888', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 74, name: 'Yasmim Brunet', initials: 'YB', class: '8º Ano A', responsible: 'Gabriel Medina', phone: '(21) 95555-9999', absences: 0, consecutive: 0, status: 'Presente' },
  { id: 75, name: 'Zezé Di Camargo', initials: 'ZC', class: '9º Ano B', responsible: 'Graciele Lacerda', phone: '(21) 95555-0000', absences: 0, consecutive: 0, status: 'Presente' },
];

const initialClasses = ['1º Ano A', '1º Ano B', '2º Ano A', '3º Ano A', '4º Ano B', '5º Ano A', '5º Ano B', '6º Ano A', '7º Ano B', '8º Ano A', '9º Ano B'];

export default function BuscaAtivaPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Ausentes');
  const [viewType, setViewType] = useState('Alunos');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  
  // Dynamic classes based on students
  const classes = useMemo(() => {
    if (students.length === 0) return initialClasses;
    const uniqueClasses = Array.from(new Set(students.map(s => s.class))).sort();
    return uniqueClasses;
  }, [students]);

  const [selectedClass, setSelectedClass] = useState(classes[0]);

  // Update selectedClass if it's no longer in the list
  useEffect(() => {
    if (!classes.includes(selectedClass) && classes.length > 0) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass]);

  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [absentStudents, setAbsentStudents] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string | null>(null);
  const [openMenuClass, setOpenMenuClass] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [notifiedIds, setNotifiedIds] = useState<number[]>([]);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [pendingStudentIds, setPendingStudentIds] = useState<number[]>([]);
  const [isGeneralAnnouncement, setIsGeneralAnnouncement] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState(
    "Olá [Responsável], notamos que o(a) [Aluno] não compareceu no dia de hoje, [Data]. Está tudo bem? Sentimos falta dele(a) nas atividades. Caso haja algum imprevisto, por favor, nos avise."
  );

  const [messagesSent, setMessagesSent] = useState(0);
  const [isAlertBannerOpen, setIsAlertBannerOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setSortMode] = useState<'update' | 'reset'>('update');
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | 'none', message: string }>({ type: 'none', message: '' });
  const [logoError, setLogoError] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [customPhoneIcon, setCustomPhoneIcon] = useState<string | null>(null);
  const phoneIconInputRef = useRef<HTMLInputElement>(null);
  const [dbStatus, setDbStatus] = useState<'loading' | 'supabase' | 'sqlite'>('loading');
  const [unitName, setUnitName] = useState('Unidade Araraquara');
  const [sortBy, setSortBy] = useState<'name' | 'class'>('name');
  const [reportConfig, setReportConfig] = useState({
    scope: 'Todos', // 'Todos', 'Ausentes', 'Críticos', or Class Name
    format: 'PDF' // 'PDF', 'Excel'
  });
  const [isAtestadoModalOpen, setIsAtestadoModalOpen] = useState(false);
  const [currentAtestadoStudent, setCurrentAtestadoStudent] = useState<Student | null>(null);
  const [atestadoDaysInput, setAtestadoDaysInput] = useState('');
  const [atestadoObsInput, setAtestadoObsInput] = useState('');

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementTarget, setAnnouncementTarget] = useState<'Todos' | 'Turma'>('Todos');
  const [announcementClass, setAnnouncementClass] = useState('');
  const [announcementStudent, setAnnouncementStudent] = useState<number | 'Todos'>('Todos');

  const isStudentInAtestado = (student: Student) => {
    if (!student.atestado_end_date) return false;
    const end = new Date(student.atestado_end_date + 'T12:00:00');
    const now = new Date();
    // Reset time parts for fair day comparison
    end.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);
    return end >= now;
  };

  // Load data from SQLite on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load settings
        const [logoRes, iconRes, unitRes] = await Promise.all([
          fetch('/api/settings?key=custom_logo').then(r => r.json()),
          fetch('/api/settings?key=custom_phone_icon').then(r => r.json()),
          fetch('/api/settings?key=unit_name').then(r => r.json())
        ]);

        if (logoRes.value) setCustomLogo(logoRes.value);
        if (iconRes.value) setCustomPhoneIcon(iconRes.value);
        if (unitRes.value) setUnitName(unitRes.value);

        const response = await fetch('/api/students');
        const data = await response.json();
        
        // Check if the response came from Supabase or SQLite via header
        const dbSource = response.headers.get('x-db-source') as 'supabase' | 'sqlite';
        
        if (response.ok) {
          setDbStatus(dbSource || 'sqlite');
        } else {
          setDbStatus('sqlite'); 
        }

        if (data && data.length > 0) {
          setStudents(data);
        } else {
          // If DB is empty, use initial data and save it
          setStudents(initialStudents);
          await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(initialStudents),
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setStudents(initialStudents);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save data to SQLite whenever students change
  const saveStudents = async (updatedStudents: Student[]) => {
    try {
      await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudents),
      });
    } catch (error) {
      console.error('Error saving students:', error);
    }
  };

  // Fuse.js configuration for fuzzy search
  const fuseOptions = useMemo(() => ({
    keys: ['name', 'class', 'responsible'],
    threshold: 0.4, // Adjust for more/less fuzzy matching (0.0 is perfect match, 1.0 matches everything)
    distance: 100,
    includeMatches: true,
    minMatchCharLength: 1,
  }), []);

  const fuse = useMemo(() => new Fuse(students, fuseOptions), [students, fuseOptions]);

  const filteredStudents = useMemo(() => {
    let base = students;
    
    // Apply class filter first if selected from Turmas view
    if (selectedClassFilter) {
      base = base.filter(s => s.class === selectedClassFilter);
    }

    if (searchTerm.trim()) {
      base = fuse.search(searchTerm).map(result => result.item);
    }
    
    if (activeTab === 'Ausentes') {
      base = base.filter(s => s.status === 'Ausente' || s.status === 'Crítico');
    } else if (activeTab === 'Críticos') {
      base = base.filter(s => s.status === 'Crítico');
    } else if (activeTab === 'Atestado') {
      base = base.filter(s => isStudentInAtestado(s));
    }

    // Apply sorting
    return [...base].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        // Sort by class, then by name within the class
        const classCompare = a.class.localeCompare(b.class);
        if (classCompare !== 0) return classCompare;
        return a.name.localeCompare(b.name);
      }
    });
  }, [searchTerm, fuse, students, activeTab, selectedClassFilter, sortBy]);

  const openMessageModal = (studentIds: number | number[]) => {
    const ids = Array.isArray(studentIds) ? studentIds : [studentIds];
    setPendingStudentIds(ids);
    setIsMessageModalOpen(true);
  };

  const confirmAndSendMessages = () => {
    const selectedData = students.filter(s => pendingStudentIds.includes(s.id));
    if (selectedData.length === 0) return;

    if (!isGeneralAnnouncement) {
      const atestadoStudents = selectedData.filter(s => isStudentInAtestado(s));
      if (atestadoStudents.length > 0) {
        const namesWithDates = atestadoStudents.map(s => {
          const dateStr = s.atestado_end_date ? new Date(s.atestado_end_date + 'T12:00:00').toLocaleDateString('pt-BR') : 'Sem data limite';
          return `- ${s.name} (até ${dateStr})`;
        }).join('\n');
        const shouldRemove = confirm(`Os alunos a seguir estão de atestado no momento:\n${namesWithDates}\n\nGostaria de removê-los da seleção?`);
        if (shouldRemove) {
          const atestadoIds = atestadoStudents.map(s => s.id);
          setPendingStudentIds(prev => prev.filter(id => !atestadoIds.includes(id)));
          setSelectedStudents(prev => prev.filter(id => !atestadoIds.includes(id)));
          alert('Alunos com atestado removidos da seleção. Por favor, clique em confirmar novamente para enviar.');
          return;
        } else {
          alert('Envio cancelado. Não é permitido enviar mensagem de ausência para alunos de atestado.');
          return;
        }
      }
    }

    const studentsWithoutPhone = selectedData.filter(s => !s.phone || String(s.phone).length < 10);
    
    if (studentsWithoutPhone.length > 0) {
      const names = studentsWithoutPhone.map(s => s.name).join(', ');
      alert(`Atenção: Os seguintes alunos não possuem telefone válido cadastrado e não receberão a mensagem: ${names}`);
    }

    const studentsWithPhone = selectedData.filter(s => s.phone && String(s.phone).replace(/\D/g, '').length >= 10);
    
    if (studentsWithPhone.length === 0) {
      alert('Nenhum dos alunos selecionados possui um telefone válido.');
      return;
    }

    if (studentsWithPhone.length > 1) {
      const confirmMulti = confirm(`Você selecionou ${studentsWithPhone.length} alunos. O navegador abrirá várias abas do WhatsApp. Certifique-se de:\n\n1. Estar logado no WhatsApp Web ou App\n2. Permitir POP-UPS para este site\n\nDeseja continuar?`);
      if (!confirmMulti) return;
    } else {
      const confirmSingle = confirm(`Deseja abrir o WhatsApp para enviar a mensagem para ${studentsWithPhone[0].name}?\n\nCertifique-se de estar logado no WhatsApp.`);
      if (!confirmSingle) return;
    }

    const today = new Date().toLocaleDateString('pt-BR');
    
    studentsWithPhone.forEach((student, index) => {
      let finalMessage = messageTemplate
        .replace('[Responsável]', student.responsible || 'Responsável')
        .replace('[Aluno]', student.name || 'Aluno')
        .replace('[Data]', today);
      
      // Clean phone number: keep only digits
      let cleanPhone = String(student.phone || '').replace(/\D/g, '');
      if (cleanPhone.length === 10 || cleanPhone.length === 11) {
        cleanPhone = '55' + cleanPhone;
      }
      
      // Open WhatsApp link
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMessage)}`;
      
      // Use a small timeout for multiple messages to try avoiding some blockers
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, index * 800);
      
      console.log(`Enviando para ${cleanPhone}: ${finalMessage}`);
    });

    setMessagesSent(prev => prev + studentsWithPhone.length);
    setNotifiedIds(prev => [...new Set([...prev, ...studentsWithPhone.map(s => s.id)])]);
    alert(`${studentsWithPhone.length} mensagem(ns) enviada(s) com sucesso!`);
    setSelectedStudents([]);
    setIsMessageModalOpen(false);
    setPendingStudentIds([]);
  };

  const toggleSelectStudent = (id: number, status: string, student: Student) => {
    if (status === 'Presente' || notifiedIds.includes(id)) return;
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const selectableStudents = filteredStudents.filter(s => s.status !== 'Presente' && !notifiedIds.includes(s.id));
    if (selectedStudents.length === selectableStudents.length && selectableStudents.length > 0) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(selectableStudents.map(s => s.id));
    }
  };

  const classesData = useMemo(() => {
    const baseClasses = classes.map(c => ({
      name: c,
      total: students.filter(s => s.class === c).length,
      absent: students.filter(s => s.class === c && s.consecutive > 0).length,
      critical: students.filter(s => s.class === c && s.status === 'Crítico').length
    }));

    if (!searchTerm.trim()) return baseClasses;

    // Simple fuzzy filter for classes too
    const classFuse = new Fuse(baseClasses, { keys: ['name'], threshold: 0.4 });
    return classFuse.search(searchTerm).map(result => result.item);
  }, [searchTerm, students, classes]);

  const studentsInSelectedClass = useMemo(() => {
    return students.filter(s => s.class === selectedClass);
  }, [selectedClass, students]);

  const toggleAbsence = (id: number) => {
    setAbsentStudents(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmAttendance = async () => {
    const classStudentIds = students.filter(s => s.class === selectedClass).map(s => s.id);
    const selectedAbsences = studentsInSelectedClass.filter(s => absentStudents.includes(s.id));
    
    // Track promises to await them
    const absencePromises: Promise<Response>[] = [];

    // Update students status based on attendance
    const updatedStudents = students.map(student => {
      if (student.class === selectedClass) {
        const isAbsent = absentStudents.includes(student.id);
        const newConsecutive = isAbsent ? (student.consecutive || 0) + 1 : 0;
        const newTotalAbsences = isAbsent ? (student.absences || 0) + 1 : (student.absences || 0);
        
        // Automatic status classification logic
        let newStatus = 'Presente';
        if (newConsecutive >= 3 || newTotalAbsences > 15) {
          newStatus = 'Crítico';
        } else if (isAbsent) {
          newStatus = 'Ausente';
        }

        // Record absence in DB if it's a new one
        if (isAbsent) {
          absencePromises.push(
            fetch('/api/absences', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ studentId: student.id, date: attendanceDate }),
            })
          );
        }

        return {
          ...student,
          status: newStatus,
          absences: newTotalAbsences,
          consecutive: newConsecutive
        };
      }
      return student;
    });

    // Await all absences to be recorded
    if (absencePromises.length > 0) {
      setIsLoading(true);
      await Promise.all(absencePromises);
      setIsLoading(false);
    }

    setStudents(updatedStudents);
    await saveStudents(updatedStudents);

    // Reset notified status for this class as it's a new attendance record
    setNotifiedIds(prev => prev.filter(id => !classStudentIds.includes(id)));

    setIsAttendanceModalOpen(false);
    setAbsentStudents([]);
    alert(`Chamada da turma ${selectedClass} realizada com sucesso para o dia ${new Date(attendanceDate + 'T12:00:00').toLocaleDateString('pt-BR')}!`);
  };

  // Reset all notifications if the date changes (simulating a new day of work)
  const handleDateChange = (newDate: string) => {
    setAttendanceDate(newDate);
    setNotifiedIds([]);
    setSelectedStudents([]);
  };

  const stats = useMemo(() => {
    const total = students.length;
    const absent = students.filter(s => s.consecutive > 0).length;
    const critical = students.filter(s => s.status === 'Crítico').length;
    return { total, absent, critical };
  }, [students]);

  const generateReport = () => {
    let dataToExport = students;
    let title = "Relatório Geral de Alunos";

    if (reportConfig.scope === 'Ausentes') {
      dataToExport = students.filter(s => s.status === 'Ausente' || s.status === 'Crítico');
      title = "Relatório de Alunos Ausentes";
    } else if (reportConfig.scope === 'Críticos') {
      dataToExport = students.filter(s => s.status === 'Crítico');
      title = "Relatório de Alunos em Situação Crítica";
    } else if (classes.includes(reportConfig.scope)) {
      dataToExport = students.filter(s => s.class === reportConfig.scope);
      title = `Relatório da Turma: ${reportConfig.scope}`;
    }

    const formattedData = dataToExport.map(s => ({
      'Nome': s.name,
      'Turma': s.class,
      'Responsável': s.responsible,
      'Telefone': s.phone,
      'Faltas Totais': s.absences,
      'Faltas Consecutivas': s.consecutive,
      'Status': isStudentInAtestado(s) ? 'Atestado' : s.status,
      'Atestado Até': s.atestado_end_date ? new Date(s.atestado_end_date + 'T12:00:00').toLocaleDateString('pt-BR') : '',
      'Observações': s.observations || ''
    }));

    if (reportConfig.format === 'CSV') {
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
      XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}.csv`);
    } else {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 30);
      
      autoTable(doc, {
        startY: 40,
        head: [['Nome', 'Turma', 'Responsável', 'Telefone', 'Faltas', 'Status', 'Atestado', 'Obs']],
        body: formattedData.map(s => [
          s['Nome'], 
          s['Turma'], 
          s['Responsável'], 
          s['Telefone'], 
          s['Faltas Totais'], 
          s['Status'],
          s['Atestado Até'],
          s['Observações']
        ]),
        theme: 'striped',
        headStyles: { fillColor: [45, 138, 97] },
        styles: { fontSize: 7, overflow: 'linebreak' },
        columnStyles: {
          7: { cellWidth: 40 } // Adjust width for observations
        }
      });

      doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
    }

    setIsReportsModalOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (importMode === 'reset') {
      setPendingFile(file);
      setIsConfirmResetOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    processFile(file, 'update');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = (file: File, mode: 'update' | 'reset') => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (json.length === 0) {
          setImportStatus({ type: 'error', message: 'O arquivo está vazio.' });
          return;
        }

        // Smart Merge Logic
        const newStudents: Student[] = json.map((row, index) => {
          const name = String(row['Nome'] || row['nome'] || row['Aluno'] || row['aluno'] || row['NOME'] || '').trim();
          const className = String(row['Turma'] || row['turma'] || row['Classe'] || row['classe'] || row['TURMA'] || '').trim();
          const responsible = String(row['Responsável'] || row['responsável'] || row['Mãe'] || row['Pai'] || row['Responsavel'] || row['RESPONSAVEL'] || '').trim();
          const rawPhone = String(row['Telefone'] || row['telefone'] || row['Celular'] || row['Contato'] || row['TELEFONE'] || '');
          
          // Clean phone number (only digits)
          let phone = rawPhone.replace(/\D/g, '');
          
          // Ensure Brazilian format 55...
          if (phone.length > 0) {
            if (phone.length === 11 || phone.length === 10) {
              phone = `55${phone}`;
            } else if (phone.length === 13 && phone.startsWith('55')) {
              // Already has 55
            }
          }

          // Find existing student to preserve history IF in update mode
          const existing = mode === 'update' ? students.find(s => 
            (s.name.toLowerCase() === name.toLowerCase() && s.class === className)
          ) : null;

          return {
            id: existing?.id || (Date.now() + index),
            name,
            initials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
            class: className,
            responsible,
            phone: phone || '',
            absences: existing?.absences || 0,
            consecutive: existing?.consecutive || 0,
            status: existing?.status || 'Presente'
          };
        }).filter(s => s.name && s.class);

        if (newStudents.length > 0) {
          setStudents(newStudents);
          await saveStudents(newStudents);
          
          if (mode === 'reset') {
            // If reset, also clear absences table in DB
            await fetch('/api/absences', { method: 'DELETE' });
          }

          setImportStatus({ 
            type: 'success', 
            message: mode === 'update' 
              ? `Sucesso! ${newStudents.length} alunos atualizados (Histórico mantido).`
              : `Sucesso! Nova base de ${newStudents.length} alunos criada (Histórico zerado).`
          });
          setIsAlertBannerOpen(true);
          setIsImportModalOpen(false);
          setTimeout(() => setImportStatus({ type: 'none', message: '' }), 5000);
        } else {
          setImportStatus({ 
            type: 'error', 
            message: 'Não foi possível identificar as colunas obrigatórias (Nome e Turma).' 
          });
        }
      } catch (err) {
        console.error('Erro ao processar arquivo:', err);
        setImportStatus({ 
          type: 'error', 
          message: 'Erro crítico ao ler o arquivo.' 
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      const img = new window.Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 400;
        
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedResult = canvas.toDataURL('image/png'); // Using png to preserve transparency
          setCustomLogo(compressedResult);
          
          await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'custom_logo', value: compressedResult })
          });
          setLogoError(false);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handlePhoneIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      const img = new window.Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 200;
        
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedResult = canvas.toDataURL('image/png');
          setCustomPhoneIcon(compressedResult);
          
          await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'custom_phone_icon', value: compressedResult })
          });
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".xlsx, .xls, .csv" 
        className="hidden" 
      />
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div 
            onClick={() => isDev && logoInputRef.current?.click()}
            className={`relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 ${isDev ? 'transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-pointer' : ''}`}
          >
            {isDev && (
              <>
                <input 
                  type="file" 
                  ref={logoInputRef} 
                  onChange={handleLogoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <p className="text-[10px] font-bold text-[#E6007E] bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-md border border-gray-100">Trocar Logo (Admin)</p>
                </div>
              </>
            )}
            {!logoError ? (
              <Image 
                src={customLogo || "/logo-ciebp.png"} 
                alt={`Logo ${unitName}`} 
                fill 
                className="object-contain p-4 drop-shadow-sm transition-all duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
                priority
                unoptimized
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#1A1A40]" />
                  <div className="w-2 h-4 rounded-full bg-[#E6007E]" />
                  <div className="w-2 h-2 rounded-full bg-[#1A1A40]" />
                </div>
                <div className="text-center">
                  <p className="text-[#E6007E] font-black text-2xl tracking-tighter leading-none">{unitName.split(' ')[0] || 'CIEBP'}</p>
                  <p className="text-[9px] text-[#1A1A40] font-black mt-1.5 uppercase tracking-[0.2em] leading-tight">{unitName.split(' ').slice(1).join(' ') || 'Unidade'}</p>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => isDev && phoneIconInputRef.current?.click()}
                className={`relative bg-[#2D8A61] p-2.5 rounded-full shadow-sm shadow-[#2D8A61]/20 overflow-hidden flex items-center justify-center ${isDev ? 'cursor-pointer hover:scale-105 transition-transform group/icon' : ''}`}
                style={{ width: '44px', height: '44px' }}
              >
                {isDev && (
                  <>
                    <input 
                      type="file" 
                      ref={phoneIconInputRef} 
                      onChange={handlePhoneIconUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity z-10">
                      <RefreshCcw className="w-3 h-3 text-white" />
                    </div>
                  </>
                )}
                {customPhoneIcon ? (
                  <Image 
                    src={customPhoneIcon} 
                    alt="Phone Icon" 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <Phone className="w-6 h-6 text-white" />
                )}
              </div>
              <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Alô presença 2.0</h1>
            </div>
            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#E6007E]/10 border-l-4 border-[#E6007E] cursor-pointer hover:bg-[#E6007E]/20 transition-colors"
                onClick={() => {
                  const newName = prompt('Digite o nome da unidade:', unitName);
                  if (newName) {
                    setUnitName(newName);
                    fetch('/api/settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ key: 'unit_name', value: newName })
                    });
                  }
                }}
            >
              <p className="text-xs text-[#E6007E] font-black uppercase tracking-widest">{unitName}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-[10px] text-gray-400 font-medium capitalize">
                {new Date(attendanceDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              {isDev && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100">
                  <div className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'supabase' ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'}`} />
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">
                    DB: {dbStatus === 'supabase' ? 'Supabase (Nuvem)' : 'SQLite (Local)'}
                  </p>
                  <button 
                    onClick={async (e) => {
                      const btn = e.currentTarget as HTMLButtonElement;
                      if (btn) btn.disabled = true;
                      try {
                        const start = Date.now();
                        const res = await fetch('/api/students');
                        if (res.ok) {
                          const end = Date.now();
                          alert(`Conexão OK!\nBanco: ${dbStatus === 'supabase' ? 'Supabase' : 'SQLite'}\nLatência: ${end - start}ms`);
                        } else {
                          throw new Error('Falha na resposta');
                        }
                      } catch (err) {
                        alert('Erro ao testar conexão. Verifique as chaves do Supabase.');
                      } finally {
                        if (btn) btn.disabled = false;
                      }
                    }}
                    className="ml-1 p-0.5 hover:bg-gray-200 rounded transition-colors"
                    title="Testar Conexão"
                  >
                    <RefreshCcw className="w-2 h-2 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => {
              setAttendanceDate(new Date().toISOString().split('T')[0]);
              setIsAttendanceModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#2D8A61] rounded-xl text-xs font-bold text-white hover:bg-[#246D4D] transition-all shadow-sm shadow-[#2D8A61]/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            Realizar Chamada
          </button>
          <button 
            onClick={() => {
              setReportConfig(prev => ({ ...prev, scope: 'Todos' }));
              setIsReportsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-gray-400" />
            Relatórios
          </button>
          <button 
            onClick={() => {
              setAnnouncementClass(classes[0] || '');
              setIsAnnouncementModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <MessageSquare className="w-4 h-4 text-gray-400" />
            Avisos Gerais
          </button>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCcw className="w-4 h-4 text-gray-400" />
            Importar
          </button>
        </div>
      </header>

      {/* Import Status Toast */}
      <AnimatePresence>
        {importStatus.type !== 'none' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              importStatus.type === 'success' 
                ? 'bg-[#E8F5EE] border-[#2D8A61]/20 text-[#2D8A61]' 
                : 'bg-red-50 border-red-100 text-red-600'
            }`}
          >
            {importStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <p className="text-sm font-bold">{importStatus.message}</p>
            <button onClick={() => setImportStatus({ type: 'none', message: '' })} className="ml-2 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Banner */}
      <AnimatePresence>
        {isAlertBannerOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="bg-[#E8F5EE] p-2.5 rounded-lg">
                <FileText className="text-[#2D8A61] w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{stats.total} alunos carregados</p>
                <p className="text-xs text-gray-400 font-medium">Dados importados da planilha</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  const templateData = [
                    { 'Nome': 'João Silva', 'Turma': '1º Ano A', 'Responsável': 'Maria Silva', 'Telefone': '11999999999' },
                    { 'Nome': 'Ana Souza', 'Turma': '1º Ano B', 'Responsável': 'Pedro Souza', 'Telefone': '11888888888' }
                  ];
                  const ws = XLSX.utils.json_to_sheet(templateData);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Modelo_Base_Alunos");
                  XLSX.writeFile(wb, "Modelo_Ideal_Busca_Ativa.xlsx");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#2D8A61] hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Baixar Modelo
              </button>
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Reimportar
              </button>
              <button 
                onClick={() => setIsAlertBannerOpen(false)}
                className="text-gray-300 hover:text-gray-500 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="text-[#2D8A61] w-5 h-5" />} label="Total de Alunos" value={stats.total.toString()} color="bg-[#E8F5EE]" />
        <StatCard icon={<UserX className="text-[#DD6B20] w-5 h-5" />} label="Ausentes Hoje" value={stats.absent.toString()} color="bg-[#FFFAF0]" />
        <StatCard icon={<AlertTriangle className="text-[#E53E3E] w-5 h-5" />} label="Situação Crítica" value={stats.critical.toString()} color="bg-[#FFF5F5]" />
        <StatCard icon={<MessageSquare className="text-[#2D8A61] w-5 h-5" />} label="Msgs Enviadas Hoje" value={messagesSent.toString()} color="bg-[#E8F5EE]" />
      </div>

      {/* Search and Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar aluno ou turma..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A61]/10 focus:border-[#2D8A61] transition-all shadow-sm placeholder:text-gray-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex bg-gray-100/80 p-1 rounded-xl">
            <button 
              onClick={() => setViewType('Alunos')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewType === 'Alunos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Users className="w-3.5 h-3.5" />
              Alunos
            </button>
            <button 
              onClick={() => setViewType('Turmas')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewType === 'Turmas' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Turmas
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            {selectedClassFilter && viewType === 'Alunos' && (
              <button 
                onClick={() => {
                  setSelectedClassFilter(null);
                  setViewType('Turmas');
                }}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
                title="Voltar para Turmas"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            )}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg font-bold text-gray-800">
                {selectedClassFilter && viewType === 'Alunos' ? `Alunos: ${selectedClassFilter}` : viewType}
              </h2>
              {selectedClassFilter && viewType === 'Alunos' && (
                <p className="text-[10px] font-bold text-[#2D8A61] uppercase tracking-widest">Filtrado por turma</p>
              )}
            </div>
          </div>
          <div className="flex bg-gray-100/80 p-1 rounded-xl w-full sm:w-auto overflow-x-auto whitespace-nowrap hide-scrollbar">
            {['Ausentes', 'Críticos', 'Todos', 'Atestado'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {viewType === 'Alunos' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 w-10">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-[#2D8A61] focus:ring-[#2D8A61] cursor-pointer"
                        checked={selectedStudents.length > 0 && selectedStudents.length === filteredStudents.filter(s => s.status !== 'Presente' && !notifiedIds.includes(s.id)).length}
                        onChange={toggleSelectAll}
                      />
                      {selectedStudents.length > 0 && (
                        <button 
                          onClick={() => openMessageModal(selectedStudents)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-[#2D8A61] text-white text-[10px] font-bold rounded-lg hover:bg-[#246D4D] transition-all whitespace-nowrap"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Enviar ({selectedStudents.length})
                        </button>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-600 transition-colors"
                    onClick={() => setSortBy('name')}
                  >
                    <div className="flex items-center gap-1">
                      Aluno
                      <ArrowUpDown className={`w-3 h-3 ${sortBy === 'name' ? 'text-[#2D8A61]' : 'text-gray-300'}`} />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-600 transition-colors"
                    onClick={() => setSortBy('class')}
                  >
                    <div className="flex items-center gap-1">
                      Turma
                      <ArrowUpDown className={`w-3 h-3 ${sortBy === 'class' ? 'text-[#2D8A61]' : 'text-gray-300'}`} />
                    </div>
                  </th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Responsável</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Faltas</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Consecutivas</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className={`hover:bg-gray-50/30 transition-colors group ${selectedStudents.includes(student.id) ? 'bg-[#E8F5EE]/20' : ''}`}>
                    <td className="px-6 py-5">
                      <input 
                        type="checkbox" 
                        className={`w-4 h-4 rounded border-gray-300 text-[#2D8A61] focus:ring-[#2D8A61] ${student.status === 'Presente' || notifiedIds.includes(student.id) ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={student.status === 'Presente' || notifiedIds.includes(student.id)}
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleSelectStudent(student.id, student.status, student)}
                      />
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className="text-sm text-gray-500 font-medium">{student.class}</span>
                    </td>
                    <td className="px-4 py-5">
                      <div>
                        <p className="text-sm font-bold text-gray-700">{student.responsible}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{student.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className="text-sm font-bold text-gray-700">{student.absences}</span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className={`text-sm font-bold ${student.consecutive >= 3 ? 'text-[#E53E3E]' : 'text-[#DD6B20]'}`}>
                        {student.consecutive}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <span className={`px-3.5 py-1.5 text-[10px] font-bold rounded-full border ${
                          isStudentInAtestado(student)
                            ? 'bg-purple-50 text-purple-600 border-purple-100'
                            : student.status === 'Crítico' 
                            ? 'bg-[#FFF5F5] text-[#E53E3E] border-[#FED7D7]' 
                            : student.status === 'Ausente'
                            ? 'bg-[#FFFAF0] text-[#DD6B20] border-[#FEEBC8]'
                            : 'bg-[#F0FFF4] text-[#2F855A] border-[#C6F6D5]'
                        }`}>
                          {isStudentInAtestado(student) ? 'Atestado' : student.status}
                        </span>
                        {notifiedIds.includes(student.id) && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-bold rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Notificado
                          </span>
                        )}
                        {(student.status === 'Ausente' || student.status === 'Crítico') && !notifiedIds.includes(student.id) && (
                          <button 
                            onClick={() => openMessageModal(student.id)}
                            className="p-1.5 text-[#2D8A61] hover:bg-[#E8F5EE] rounded-lg transition-colors"
                            title="Enviar mensagem"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setCurrentAtestadoStudent(student);
                            setAtestadoDaysInput('');
                            setAtestadoObsInput(student.observations || '');
                            setIsAtestadoModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Atestado / Observações"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {classesData.map((cls) => (
                <div 
                  key={cls.name} 
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-[#2D8A61]/30 transition-all group relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div 
                      className="bg-[#E8F5EE] p-2.5 rounded-xl cursor-pointer"
                      onClick={() => {
                        setSelectedClassFilter(cls.name);
                        setViewType('Alunos');
                        setActiveTab('Todos');
                      }}
                    >
                      <LayoutGrid className="text-[#2D8A61] w-5 h-5" />
                    </div>
                    <div className="relative z-10">
                      <button 
                        onClick={() => setOpenMenuClass(openMenuClass === cls.name ? null : cls.name)}
                        className="text-gray-300 hover:text-gray-500 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      <AnimatePresence>
                        {openMenuClass === cls.name && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenMenuClass(null)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20"
                            >
                              <button 
                                onClick={() => {
                                  setReportConfig({ scope: cls.name, format: 'PDF' });
                                  setIsReportsModalOpen(true);
                                  setOpenMenuClass(null);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-[#2D8A61] transition-colors flex items-center gap-2"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Relatório da Turma
                              </button>
                              <div className="h-px bg-gray-50 my-1" />
                              <button 
                                onClick={() => {
                                  alert(`Editando configurações de ${cls.name}...`);
                                  setOpenMenuClass(null);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors flex items-center gap-2"
                              >
                                <RefreshCcw className="w-3.5 h-3.5" />
                                Editar Turma
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  <div 
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedClassFilter(cls.name);
                      setViewType('Alunos');
                      setActiveTab('Todos');
                    }}
                  >
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{cls.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Users className="w-3.5 h-3.5" />
                        {cls.total} Alunos
                      </div>
                      <div className="flex items-center gap-1.5 text-[#DD6B20]">
                        <UserX className="w-3.5 h-3.5" />
                        {cls.absent} Ausentes
                      </div>
                      {cls.critical > 0 && (
                        <div className="flex items-center gap-1.5 text-[#E53E3E]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {cls.critical} Críticos
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedClass(cls.name);
                      setAttendanceDate(new Date().toISOString().split('T')[0]);
                      setIsAttendanceModalOpen(true);
                      setAbsentStudents([]);
                    }}
                    className="w-full mt-6 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-[#2D8A61] hover:text-white hover:border-[#2D8A61] transition-all relative z-10"
                  >
                    Realizar Chamada
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attendance Modal */}
      <AnimatePresence>
        {isAttendanceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAttendanceModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-[#2D8A61] p-2 rounded-lg">
                    <Calendar className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Realizar Chamada Diária</h3>
                    <p className="text-xs text-gray-500 font-medium">Selecione apenas os alunos faltosos</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Class Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Turma</label>
                    <div className="relative">
                      <select 
                        value={selectedClass}
                        onChange={(e) => {
                          setSelectedClass(e.target.value);
                          setAbsentStudents([]);
                        }}
                        className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2D8A61]/10 focus:border-[#2D8A61] transition-all cursor-pointer"
                      >
                        {classes.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data da Chamada</label>
                    <input 
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2D8A61]/10 focus:border-[#2D8A61] transition-all"
                    />
                  </div>
                </div>

                {/* Students List */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lista de Alunos ({studentsInSelectedClass.length})</label>
                    <span className="text-[10px] font-bold text-[#E53E3E] bg-[#FFF5F5] px-2 py-0.5 rounded-full border border-[#FED7D7]">
                      {absentStudents.length} Faltas Marcadas
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {studentsInSelectedClass.length > 0 ? (
                      studentsInSelectedClass.map(student => (
                        <button
                          key={student.id}
                          onClick={() => toggleAbsence(student.id)}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                            absentStudents.includes(student.id)
                              ? 'bg-[#FFF5F5] border-[#FED7D7] shadow-sm'
                              : 'bg-white border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                              absentStudents.includes(student.id)
                                ? 'bg-[#E53E3E] border-[#E53E3E] text-white'
                                : 'bg-gray-50 border-gray-100 text-gray-400'
                            }`}>
                              <User className="w-4 h-4" />
                            </div>
                            <span className={`text-sm font-bold ${absentStudents.includes(student.id) ? 'text-[#E53E3E]' : 'text-gray-700'}`}>
                              {student.name}
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            absentStudents.includes(student.id)
                              ? 'bg-[#E53E3E] border-[#E53E3E]'
                              : 'border-gray-200'
                          }`}>
                            {absentStudents.includes(student.id) && <X className="text-white w-3 h-3 font-bold" />}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-12 text-center space-y-2">
                        <Users className="w-12 h-12 text-gray-200 mx-auto" />
                        <p className="text-sm text-gray-400 font-medium">Nenhum aluno encontrado para esta turma.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                <button 
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmAttendance}
                  disabled={studentsInSelectedClass.length === 0}
                  className="flex-1 px-4 py-3 bg-[#2D8A61] rounded-xl text-sm font-bold text-white hover:bg-[#246D4D] transition-all shadow-sm shadow-[#2D8A61]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Chamada
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Atestado Modal */}
      <AnimatePresence>
        {isAtestadoModalOpen && currentAtestadoStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAtestadoModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-purple-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <FileText className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Atestado / Observações</h3>
                    <p className="text-xs text-gray-500 font-medium">{currentAtestadoStudent.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAtestadoModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lançar Atestado (Dias)</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="Ex: 5"
                    value={atestadoDaysInput}
                    onChange={(e) => setAtestadoDaysInput(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-600 transition-all"
                  />
                  {currentAtestadoStudent.atestado_end_date && isStudentInAtestado(currentAtestadoStudent) && (
                    <p className="text-xs text-purple-600 font-bold mt-1">
                      Atestado atual válido até: {new Date(currentAtestadoStudent.atestado_end_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Observações</label>
                  <textarea 
                    rows={4}
                    placeholder="Relate um problema ou adicione uma informação útil..."
                    value={atestadoObsInput}
                    onChange={(e) => setAtestadoObsInput(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-600 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                <button 
                  onClick={() => setIsAtestadoModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                    let newEndDate = currentAtestadoStudent.atestado_end_date;
                    const days = parseInt(atestadoDaysInput);
                    if (!isNaN(days) && days > 0) {
                      const end = new Date();
                      end.setDate(end.getDate() + days - 1); // If 1 day, it means today
                      newEndDate = end.toISOString().split('T')[0];
                    } else if (atestadoDaysInput === '0') {
                      newEndDate = undefined; // Clear atestado
                    }

                    const updatedStudent = {
                      ...currentAtestadoStudent,
                      atestado_end_date: newEndDate,
                      observations: atestadoObsInput
                    };

                    const newStudents = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
                    setStudents(newStudents);
                    await saveStudents([updatedStudent]);
                    setIsAtestadoModalOpen(false);
                    alert('Informações salvas com sucesso!');
                  }}
                  className="flex-1 px-4 py-3 bg-purple-600 rounded-xl text-sm font-bold text-white hover:bg-purple-700 transition-all shadow-sm shadow-purple-600/20"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reports Modal */}
      <AnimatePresence>
        {isReportsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-[#E8F5EE] p-2.5 rounded-xl">
                    <FileText className="w-5 h-5 text-[#2D8A61]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Exportar Relatório</h3>
                    <p className="text-xs text-gray-400 font-bold mt-0.5">Selecione o formato e o escopo</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsReportsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Escopo do Relatório</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Todos', 'Ausentes', 'Críticos'].map(scope => (
                      <button
                        key={scope}
                        onClick={() => setReportConfig(prev => ({ ...prev, scope }))}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          reportConfig.scope === scope 
                            ? 'bg-[#E8F5EE] border-[#2D8A61] text-[#2D8A61]' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        {scope}
                      </button>
                    ))}
                    <div className="col-span-2 relative">
                      <select 
                        value={classes.includes(reportConfig.scope) ? reportConfig.scope : ''}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, scope: e.target.value }))}
                        className={`w-full appearance-none px-4 py-2.5 rounded-xl text-xs font-bold border transition-all focus:outline-none ${
                          classes.includes(reportConfig.scope)
                            ? 'bg-[#E8F5EE] border-[#2D8A61] text-[#2D8A61]' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        <option value="" disabled>Selecionar Turma...</option>
                        {classes.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Formato de Saída</label>
                  <div className="flex gap-2">
                    {['PDF', 'CSV'].map(format => (
                      <button
                        key={format}
                        onClick={() => setReportConfig(prev => ({ ...prev, format }))}
                        className={`flex-1 px-4 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                          reportConfig.format === format 
                            ? 'bg-[#E8F5EE] border-[#2D8A61] text-[#2D8A61]' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        {format === 'PDF' ? <FileText className="w-4 h-4" /> : <List className="w-4 h-4" />}
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-bold">Registros encontrados:</span>
                    <span className="text-sm font-black text-[#2D8A61]">
                      {reportConfig.scope === 'Todos' ? students.length :
                       reportConfig.scope === 'Ausentes' ? students.filter(s => s.status === 'Ausente' || s.status === 'Crítico').length :
                       reportConfig.scope === 'Críticos' ? students.filter(s => s.status === 'Crítico').length :
                       students.filter(s => s.class === reportConfig.scope).length}
                    </span>
                  </div>
                  <div className="flex gap-2 items-start pt-2 border-t border-gray-200/50">
                    <AlertTriangle className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gray-400 font-medium leading-tight">
                      Os relatórios são gerados localmente. Os dados dos alunos permanecem protegidos no seu dispositivo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                <button 
                  onClick={() => setIsReportsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={generateReport}
                  className="flex-1 px-4 py-3 bg-[#2D8A61] rounded-xl text-sm font-bold text-white hover:bg-[#246D4D] transition-all shadow-sm shadow-[#2D8A61]/20"
                >
                  Gerar Relatório
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Announcement Modal */}
      <AnimatePresence>
        {isAnnouncementModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAnnouncementModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-[#2D8A61] p-2.5 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Avisos Gerais</h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Selecione o público-alvo da mensagem</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Público-Alvo</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAnnouncementTarget('Todos')}
                      className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all ${
                        announcementTarget === 'Todos' 
                          ? 'bg-[#E8F5EE] border-[#2D8A61] text-[#2D8A61]' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Todos os Alunos
                    </button>
                    <button
                      onClick={() => setAnnouncementTarget('Turma')}
                      className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all ${
                        announcementTarget === 'Turma' 
                          ? 'bg-[#E8F5EE] border-[#2D8A61] text-[#2D8A61]' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Selecionar Turma
                    </button>
                  </div>
                </div>

                {announcementTarget === 'Turma' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qual Turma?</label>
                      <div className="relative">
                        <select 
                          value={announcementClass}
                          onChange={(e) => {
                            setAnnouncementClass(e.target.value);
                            setAnnouncementStudent('Todos');
                          }}
                          className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2D8A61]/20 focus:border-[#2D8A61] transition-all cursor-pointer"
                        >
                          {classes.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Para quem na turma?</label>
                      <div className="relative">
                        <select 
                          value={announcementStudent}
                          onChange={(e) => setAnnouncementStudent(e.target.value === 'Todos' ? 'Todos' : Number(e.target.value))}
                          className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2D8A61]/20 focus:border-[#2D8A61] transition-all cursor-pointer"
                        >
                          <option value="Todos">A Turma Inteira</option>
                          {students.filter(s => s.class === announcementClass).map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                <button 
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    let targetIds: number[] = [];
                    if (announcementTarget === 'Todos') {
                      targetIds = students.map(s => s.id);
                    } else if (announcementTarget === 'Turma') {
                      if (announcementStudent === 'Todos') {
                        targetIds = students.filter(s => s.class === announcementClass).map(s => s.id);
                      } else {
                        targetIds = [announcementStudent as number];
                      }
                    }
                    
                    if (targetIds.length > 0) {
                      setPendingStudentIds(targetIds);
                      setIsGeneralAnnouncement(true);
                      setMessageTemplate("Olá [Responsável], vimos informar que haverá [Evento] no dia [Data]...\n\nAtenciosamente,\nDireção.");
                      setIsAnnouncementModalOpen(false);
                      setIsMessageModalOpen(true);
                    } else {
                      alert('Nenhum aluno encontrado para a seleção.');
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-[#2D8A61] rounded-xl text-sm font-bold text-white hover:bg-[#246D4D] transition-all shadow-sm shadow-[#2D8A61]/20"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Message Modal */}
      <AnimatePresence>
        {isMessageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMessageModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-[#E8F5EE] p-2.5 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-[#2D8A61]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Ajustar Mensagem</h3>
                    <p className="text-xs text-gray-400 font-bold mt-0.5">Confira e edite o texto antes de enviar</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMessageModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Template da Mensagem</label>
                    <select 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'ausencia') {
                          setIsGeneralAnnouncement(false);
                          setMessageTemplate("Olá [Responsável], notamos que o(a) [Aluno] não compareceu no dia de hoje, [Data]. Está tudo bem? Sentimos falta dele(a) nas atividades. Caso haja algum imprevisto, por favor, nos avise.");
                        } else if (val === 'reuniao') {
                          setIsGeneralAnnouncement(true);
                          setMessageTemplate("Olá [Responsável], convidamos você para a Reunião de Pais que ocorrerá no dia [Data]. Sua presença é muito importante para o acompanhamento do(a) [Aluno]!");
                        } else if (val === 'evento') {
                          setIsGeneralAnnouncement(true);
                          setMessageTemplate("Olá [Responsável], informamos que teremos um evento especial na escola para o(a) [Aluno]. Aguardamos vocês!");
                        } else if (val === 'suspenso') {
                          setIsGeneralAnnouncement(true);
                          setMessageTemplate("Olá [Responsável], solicitamos seu comparecimento à escola com urgência para tratar de assuntos referentes ao comportamento do(a) [Aluno].");
                        } else if (val === 'letivo') {
                          setIsGeneralAnnouncement(true);
                          setMessageTemplate("Olá [Responsável], informamos que [Data] será/não será dia letivo. Fique atento ao calendário escolar.");
                        }
                      }}
                      className="text-[10px] font-bold text-[#2D8A61] bg-[#E8F5EE] border-none rounded-lg px-2 py-1 outline-none cursor-pointer"
                      defaultValue={isGeneralAnnouncement ? "evento" : "ausencia"}
                    >
                      <option value="ausencia">Ausência (Padrão)</option>
                      <option value="reuniao">Reunião de Pais</option>
                      <option value="evento">Evento Escolar</option>
                      <option value="suspenso">Aluno Suspenso</option>
                      <option value="letivo">Dia Letivo / Não Letivo</option>
                    </select>
                  </div>
                  <textarea 
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    className="w-full h-40 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-700 font-medium focus:ring-2 focus:ring-[#2D8A61]/20 focus:border-[#2D8A61] transition-all resize-none outline-none"
                    placeholder="Escreva a mensagem aqui..."
                  />
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded-md text-[10px] font-bold text-gray-500">[Responsável]</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-md text-[10px] font-bold text-gray-500">[Aluno]</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-md text-[10px] font-bold text-gray-500">[Data]</span>
                  </div>
                  <p className="text-[10px] text-gray-400 italic">Os campos acima serão substituídos automaticamente pelos dados de cada aluno.</p>
                </div>

                <div className="bg-[#E8F5EE]/50 p-4 rounded-2xl border border-[#E8F5EE] space-y-3">
                  <p className="text-xs text-[#2D8A61] font-bold leading-relaxed">
                    Você está enviando esta mensagem para <span className="underline">{pendingStudentIds.length}</span> aluno(s).
                  </p>
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#2D8A61] shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[#2D8A61]/70 font-medium leading-tight">
                      Segurança: Os dados de contato são processados localmente. O envio de mensagens respeita a privacidade dos dados escolares.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                <button 
                  onClick={() => setIsMessageModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmAndSendMessages}
                  className="flex-1 px-4 py-3 bg-[#2D8A61] rounded-xl text-sm font-bold text-white hover:bg-[#246D4D] transition-all shadow-sm shadow-[#2D8A61]/20"
                >
                  Confirmar e Enviar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-[#2D8A61] p-2 rounded-lg">
                    <RefreshCcw className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Importar Base de Dados</h2>
                    <p className="text-xs text-gray-500 font-medium">Atualize a lista de alunos da escola</p>
                  </div>
                </div>
                <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Security Note */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4">
                  <AlertTriangle className="text-blue-500 w-5 h-5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-blue-900">Privacidade e Segurança</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Seus dados são processados localmente. Nenhuma informação de alunos ou menores é enviada para nossos servidores.
                    </p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-800">Escolha o modo de importação:</h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => setSortMode('update')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        importMode === 'update' 
                          ? 'border-[#2D8A61] bg-[#E8F5EE]/30' 
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <RefreshCcw className={`w-4 h-4 ${importMode === 'update' ? 'text-[#2D8A61]' : 'text-gray-400'}`} />
                        <span className={`text-sm font-bold ${importMode === 'update' ? 'text-[#2D8A61]' : 'text-gray-700'}`}>Atualizar Alunos</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                        Adiciona novos alunos e remove desistentes. <span className="font-bold text-[#2D8A61]">Mantém o histórico de faltas</span> dos alunos que já estão no sistema.
                      </p>
                    </button>

                    <button 
                      onClick={() => setSortMode('reset')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        importMode === 'reset' 
                          ? 'border-red-500 bg-red-50/30' 
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <AlertTriangle className={`w-4 h-4 ${importMode === 'reset' ? 'text-red-500' : 'text-gray-400'}`} />
                        <span className={`text-sm font-bold ${importMode === 'reset' ? 'text-red-500' : 'text-gray-700'}`}>Nova Base (Zerar Tudo)</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                        Substitui todos os dados. <span className="font-bold text-red-500">Apaga permanentemente todo o histórico de faltas</span> e recomeça do zero.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    onClick={() => {
                      const templateData = [
                        { 'Nome': 'Exemplo: João Silva', 'Turma': '1º Ano A', 'Responsável': 'Maria Silva', 'Telefone': '11999999999' },
                        { 'Nome': 'Exemplo: Ana Souza', 'Turma': '1º Ano B', 'Responsável': 'Pedro Souza', 'Telefone': '11888888888' },
                        { 'Nome': '', 'Turma': '', 'Responsável': '', 'Telefone': '' },
                        { 'Nome': '', 'Turma': '', 'Responsável': '', 'Telefone': '' },
                        { 'Nome': '', 'Turma': '', 'Responsável': '', 'Telefone': '' }
                      ];
                      const ws = XLSX.utils.json_to_sheet(templateData);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Base_Alunos");
                      XLSX.writeFile(wb, "Modelo_Ideal_Alo_Presenca.xlsx");
                    }}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-[#2D8A61] hover:bg-[#F0F9F4] transition-all group"
                  >
                    <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-white transition-colors">
                      <FileText className="w-6 h-6 text-gray-400 group-hover:text-[#2D8A61]" />
                    </div>
                    <span className="text-xs font-bold text-gray-600 group-hover:text-[#2D8A61]">Baixar Modelo Ideal</span>
                  </button>

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-2xl transition-all group ${
                      importMode === 'reset' 
                        ? 'border-red-200 hover:border-red-500 hover:bg-red-50' 
                        : 'border-gray-200 hover:border-[#2D8A61] hover:bg-[#F0F9F4]'
                    }`}
                  >
                    <div className={`p-3 rounded-xl transition-colors ${importMode === 'reset' ? 'bg-red-50 group-hover:bg-white' : 'bg-gray-50 group-hover:bg-white'}`}>
                      {importMode === 'reset' ? (
                        <AlertTriangle className="w-6 h-6 text-red-400 group-hover:text-red-500" />
                      ) : (
                        <RefreshCcw className="w-6 h-6 text-gray-400 group-hover:text-[#2D8A61]" />
                      )}
                    </div>
                    <span className={`text-xs font-bold transition-colors ${importMode === 'reset' ? 'text-red-600' : 'text-gray-600 group-hover:text-[#2D8A61]'}`}>
                      {importMode === 'reset' ? 'Zerar e Importar' : 'Atualizar e Importar'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Double Confirmation Modal for Reset */}
      <AnimatePresence>
        {isConfirmResetOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-red-100"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ação Irreversível!</h2>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    Você está prestes a <span className="text-red-600 font-bold">APAGAR TODO O HISTÓRICO</span> de faltas e recomeçar com uma nova base.
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-2xl space-y-3">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Confirmação de Segurança</p>
                  <p className="text-xs text-red-700 font-medium">
                    Para confirmar, digite a palavra <span className="font-black underline">ZERAR</span> abaixo:
                  </p>
                  <input 
                    type="text" 
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value.toUpperCase())}
                    placeholder="Digite aqui..."
                    className="w-full px-4 py-3 bg-white border-2 border-red-100 rounded-xl text-center font-black text-red-600 focus:outline-none focus:border-red-500 transition-all placeholder:text-red-200"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700">Importante: WhatsApp Web/App</span>
                  </div>
                  <p className="text-[10px] text-amber-600 font-medium leading-tight">
                    Para que o envio funcione, certifique-se de estar logado no WhatsApp Web ou no aplicativo de computador. 
                    Se enviar para vários alunos, o navegador pode solicitar permissão para abrir múltiplas janelas (Pop-ups).
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => {
                      setIsConfirmResetOpen(false);
                      setResetConfirmText('');
                      setPendingFile(null);
                    }}
                    className="flex-1 px-6 py-4 bg-gray-100 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    disabled={resetConfirmText !== 'ZERAR'}
                    onClick={() => {
                      if (pendingFile) {
                        processFile(pendingFile, 'reset');
                        setIsConfirmResetOpen(false);
                        setResetConfirmText('');
                        setPendingFile(null);
                      }
                    }}
                    className="flex-1 px-6 py-4 bg-red-500 rounded-2xl text-sm font-bold text-white hover:bg-red-600 transition-all shadow-lg shadow-red-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Confirmar Reset
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Credit */}
      <footer className="mt-12 pb-8 flex flex-col items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-[#1A1A40]" />
          <div className="w-1 h-2 rounded-full bg-[#E6007E]" />
          <div className="w-1 h-1 rounded-full bg-[#1A1A40]" />
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
          Desenvolvido por <span className="text-[#E6007E]">{unitName}</span>
        </p>
      </footer>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
      <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-400 font-bold mt-2">{label}</p>
      </div>
    </div>
  );
}

