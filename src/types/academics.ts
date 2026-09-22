export interface School {
  id: number;
  name: string;
  code?: string | null;
}

export interface Department {
  id: number;
  name: string;
  code?: string | null;
  school?: School | number | null;
}

export interface Programme {
  id: number;
  name: string;
  code?: string | null;
  department?: Department | number | null;
}

export interface ProfilePayload {
  programme?: number;
  current_year?: number;
  admission_year?: number;
  department?: number;
}
