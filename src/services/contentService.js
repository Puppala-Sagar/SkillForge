import axios from "axios";

const url = "http://localhost:5000/api/";

export const addContent = async (subject, subtopic, content) => {
    try {
        console.log(subject + " " + subtopic + " " + " " + content);
        const response = await axios.post("http://localhost:5000/api/add-subtopic", { subject, subtopic, content });
        return response.data;
    } catch (error) {
        // console.error(error);
        return error;
    }
}

export const getContent = async (subject, subtopic) => {
    try {
        // console.log(url + "get-subtopic", { params: { subject, subtopic } });
        const response = await axios.get("http://localhost:5000/api/get-subtopic" + "/" + subject + "/" + subtopic);
        return response.data;
    } catch (error) {
        // console.error(error);
        return error;
    }
}

export const addQuiz = async (subject, subtopic, quiz) => {
    try {
        const response = await axios.post(url + "add-quiz" + "/" + subject + "/" + subtopic, { quiz });
        return response.data;
    } catch (error) {
        return error;
    }
}

export const submitQuizAnswers = async (subject, subtopic, answers) => {
    try {
        const response = await axios.post(url + "submit-answers" + "/" + subject + "/" + subtopic, { answers });
        return response.data;
    } catch (error) {
        return error;
    }
}
