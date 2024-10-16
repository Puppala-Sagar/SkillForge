
import axios from "axios";

const url = "http://localhost:5000/api/";

export const getContent = async (subject, subtopic) => {
  try {
    const response = await axios.get(`${url}get-subtopic/${subject}/${subtopic}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitQuizAnswers = async (subject, subtopic, answers) => {
  try {
    const response = await axios.post(`${url}submit-answers/${subject}/${subtopic}`, { answers });
    return response.data;
  } catch (error) {
    throw error;
  }
};
