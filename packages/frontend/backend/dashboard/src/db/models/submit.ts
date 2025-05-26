import mongoose, { Schema, Document } from "mongoose";
import { MembersRights } from "@com.synergy/frontend-backend-dashboard/membersTypes";

interface Option {
  text: string;
  type: string;
  uid: string;
  title: string;
  disabled: boolean;
  span: number;
  description: string;
  addQuestion?: string;
  addForm?: string;
  icon?: {
    src: string;
    alt: string;
  };
}

interface Message {
  text: string;
  type: string;
  requiredMessage?: string;
  successMessage?: string;
  checkPreviousFormsMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
}

export interface Form {
  order: number;
  uid: string;
  type: string;
  multiple?: boolean;
  required: boolean;
  defaultVisible: boolean;
  title: string;
  description: string;
  from: string[];
  localStorage?: boolean;
  span: number;
  message: Message;
  options?: Record<string, Option>;
  selected?: {
    questionTitle: string;
    selectedOptions?: string[];
    selectedOptionsUid?: string[];
    selectedValue?: number;
    inputValue?: string;
    rangeValue?: number;
    selectedFiles?: any[];
    scheduledEvent?: {
      event: { uri: string };
      invitee: { uri: string };
    };
  };
}

export interface QuestionElement {
  title: string;
  description: string;
  from: string[];
  uid: string;
  version: string;
  form: Record<string, Form>;
}

export interface SubmitStatusInterface {
  code: string;
  message: string;
  color: string;
}

export interface AssetInterface {
  name: string;
  size: number;
  type: string;
  filePath: string;
  status: string;
  createdAt: Date;
}

export interface GetSubmitsInterface {
  success: boolean;
  data: SubmitInterface[];
}

export interface GetSubmitInterface {
  success: boolean;
  data: SubmitInterface;
}

export interface SubmitInterface extends Document<string> {
  title: string;
  data: Record<string, QuestionElement>;
  emailAddress: string;
  createdAt: Date;
  assets?: AssetInterface[];
  status: SubmitStatusInterface;
  visibility: string;
  members?: MembersRights[];
}

const OptionSchema = new Schema<Option>({
  text: { type: String, required: true },
  type: { type: String, required: true },
  uid: { type: String, required: true },
  title: { type: String, required: true },
  disabled: { type: Boolean, required: true },
  span: { type: Number, required: true },
  description: { type: String, required: true },
  addQuestion: { type: String },
  addForm: { type: String },
  icon: {
    src: { type: String },
    alt: { type: String },
  },
});

const MessageSchema = new Schema<Message>({
  text: { type: String, required: true },
  type: { type: String, required: true },
  requiredMessage: { type: String },
  successMessage: { type: String },
  checkPreviousFormsMessage: { type: String },
  errorMessage: { type: String },
  loadingMessage: { type: String },
});

const FormSchema = new Schema<Form>({
  order: { type: Number, required: true },
  uid: { type: String, required: true },
  type: { type: String, required: true },
  multiple: { type: Boolean },
  required: { type: Boolean, required: true },
  defaultVisible: { type: Boolean, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  from: { type: [String], required: true },
  localStorage: { type: Boolean },
  span: { type: Number, required: true },
  message: { type: MessageSchema, required: true },
  options: { type: Map, of: OptionSchema },
  selected: {
    questionTitle: { type: String },
    selectedOptions: { type: [String] },
    selectedOptionsUid: { type: [String] },
    selectedValue: { type: Number },
    inputValue: { type: String },
    rangeValue: { type: Number },
    selectedFiles: { type: [Schema.Types.Mixed] },
    scheduledEvent: {
      event: { uri: { type: String } },
      invitee: { uri: { type: String } },
    },
  },
});

const QuestionElementSchema = new Schema<QuestionElement>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  from: { type: [String], required: true },
  uid: { type: String, required: true },
  version: { type: String, required: true },
  form: { type: Map, of: FormSchema, required: true },
});

const anySchema = new Schema<any>({});

const SubmitStatusSchema = new Schema<SubmitStatusInterface>({
  code: { type: String, required: true },
  message: { type: String, required: true },
  color: { type: String, required: true },
});

const SubmitSchema = new Schema<SubmitInterface>({
  title: { type: String, required: false },
  data: { type: Map, of: Schema.Types.Mixed, required: true },
  emailAddress: { type: String, required: true },
  status: { type: SubmitStatusSchema, required: false },
  assets: { type: Array<AssetInterface>, required: false },
  createdAt: { type: Date, default: Date.now, required: true },
  visibility: { type: String, required: false, default: "public" },
  members: { type: Array<MembersRights>, required: false },
});

export default mongoose.models.Submit || mongoose.model("Submit", SubmitSchema);
