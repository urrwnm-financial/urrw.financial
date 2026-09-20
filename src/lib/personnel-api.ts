import { supabase } from "./supabase";
import type { Personnel } from "./types";

export interface PersonnelInput {
  username: string;
  password?: string;
  prefix: string;
  firstName: string;
  lastName: string;
  position: string;
  subjectGroup: string;
  role: string;
}

export interface Caller {
  username: string;
  password: string;
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

export async function addPersonnel(caller: Caller, input: PersonnelInput): Promise<Personnel> {
  const { data, error } = await supabase.rpc("add_personnel", {
    p_caller_username: caller.username,
    p_caller_password: caller.password,
    p_username: input.username,
    p_password: input.password,
    p_prefix: input.prefix,
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_position: input.position,
    p_subject_group: input.subjectGroup,
    p_role: input.role,
  });
  if (error) throw error;
  return mapRow(data[0]);
}

export async function updatePersonnel(
  caller: Caller,
  id: string,
  input: PersonnelInput,
): Promise<Personnel> {
  const { data, error } = await supabase.rpc("update_personnel", {
    p_caller_username: caller.username,
    p_caller_password: caller.password,
    p_id: id,
    p_username: input.username,
    p_password: input.password || null,
    p_prefix: input.prefix,
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_position: input.position,
    p_subject_group: input.subjectGroup,
    p_role: input.role,
  });
  if (error) throw error;
  return mapRow(data[0]);
}

export async function deletePersonnel(caller: Caller, id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_personnel", {
    p_caller_username: caller.username,
    p_caller_password: caller.password,
    p_id: id,
  });
  if (error) throw error;
}

function mapRow(row: {
  id: string;
  username: string;
  prefix: string;
  first_name: string;
  last_name: string;
  job_position: string;
  subject_group: string;
  role: string;
}): Personnel {
  return {
    id: row.id,
    username: row.username,
    prefix: row.prefix,
    firstName: row.first_name,
    lastName: row.last_name,
    position: row.job_position,
    subjectGroup: row.subject_group,
    role: row.role,
  };
}
