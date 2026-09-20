import { supabase } from "./supabase";
import type { Caller } from "./personnel-api";
import type { DocumentScan } from "./types";

export interface DocumentScanInput {
  docType: string;
  fiscalYear: number;
  projectName: string;
  activityName: string;
}

export async function uploadScanFile(file: Blob, fiscalYear: number): Promise<string> {
  const path = `${fiscalYear}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from("document-scans").upload(path, file, {
    contentType: "image/jpeg",
  });
  if (error) throw error;
  return path;
}

export async function addDocumentScan(caller: Caller, input: DocumentScanInput, file: Blob): Promise<DocumentScan> {
  const filePath = await uploadScanFile(file, input.fiscalYear);
  const { data, error } = await supabase.rpc("add_document_scan", {
    p_caller_username: caller.username,
    p_caller_password: caller.password,
    p_doc_type: input.docType,
    p_fiscal_year: input.fiscalYear,
    p_project_name: input.projectName,
    p_activity_name: input.activityName,
    p_file_path: filePath,
  });
  if (error) throw error;
  return mapRow(data[0]);
}

export async function updateDocumentScan(
  caller: Caller,
  id: string,
  input: DocumentScanInput,
): Promise<DocumentScan> {
  const { data, error } = await supabase.rpc("update_document_scan", {
    p_caller_username: caller.username,
    p_caller_password: caller.password,
    p_id: id,
    p_doc_type: input.docType,
    p_fiscal_year: input.fiscalYear,
    p_project_name: input.projectName,
    p_activity_name: input.activityName,
  });
  if (error) throw error;
  return mapRow(data[0]);
}

export async function listDocumentScans(): Promise<DocumentScan[]> {
  const { data, error } = await supabase.rpc("list_document_scans");
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export function getScanFileUrl(filePath: string): string {
  return supabase.storage.from("document-scans").getPublicUrl(filePath).data.publicUrl;
}

function mapRow(row: {
  id: string;
  doc_type: string;
  fiscal_year: number;
  project_name: string;
  activity_name: string;
  file_path: string;
  scanned_by_username: string;
  created_at: string;
}): DocumentScan {
  return {
    id: row.id,
    docType: row.doc_type,
    fiscalYear: row.fiscal_year,
    projectName: row.project_name,
    activityName: row.activity_name,
    filePath: row.file_path,
    scannedByUsername: row.scanned_by_username,
    createdAt: row.created_at,
  };
}
