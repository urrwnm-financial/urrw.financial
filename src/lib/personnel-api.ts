import { supabase } from "./supabase";
import type { Personnel } from "./types";

export interface PersonnelInput {
  username: string;
  password?: string;
  name: string;
  position: string;
  subjectGroup: string;
}

export async function login(username: string, password: string) {
  const { data, error } = await supabase.rpc("login", {
    p_username: username,
    p_password: password,
  });
  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;
  return row as { username: string; name: string; role: string };
}

export async function listPersonnel(): Promise<Personnel[]> {
  const { data, error } = await supabase.rpc("list_personnel");
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function addPersonnel(input: PersonnelInput): Promise<Personnel> {
  const { data, error } = await supabase.rpc("add_personnel", {
    p_username: input.username,
    p_password: input.password,
    p_name: input.name,
    p_position: input.position,
    p_subject_group: input.subjectGroup,
  });
  if (error) throw error;
  return mapRow(data[0]);
}

export async function updatePersonnel(id: string, input: PersonnelInput): Promise<Personnel> {
  const { data, error } = await supabase.rpc("update_personnel", {
    p_id: id,
    p_username: input.username,
    p_password: input.password || null,
    p_name: input.name,
    p_position: input.position,
    p_subject_group: input.subjectGroup,
  });
  if (error) throw error;
  return mapRow(data[0]);
}

export async function deletePersonnel(id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_personnel", { p_id: id });
  if (error) throw error;
}

function mapRow(row: {
  id: string;
  username: string;
  name: string;
  position: string;
  subject_group: string;
}): Personnel {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    position: row.position,
    subjectGroup: row.subject_group,
  };
}
