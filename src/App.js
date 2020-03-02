import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Select from "react-select";
import DatePicker from "react-datepicker";
import moment from "moment";
import Modal from "react-modal";
import { DotLoader } from "react-spinners";

import "react-datepicker/dist/react-datepicker.css";
import "./App.css";
import {
  courses,
  availableStartDates
} from "./data.js";

const customStyles = {
  content: {
    width: "150px",
    height: "200px",
    border: "1px solid #979797",
    boxShadow: "6px 0px 18px rgba(0, 0, 0, 0.06)"
  }
};

Modal.setAppElement("#root");

function isInArray(array, value) {
  return (
    (
      array.find(item => {
        return item === moment(value).format("YYYY-MM-DD");
      }) || []
    ).length > 0
  );
}

const useCourseOption = (initOption, setSubject) => {
  const [course, setCourse] = useState(initOption);
  const [error, setError] = useState("");
  
  const handleSelectOption = (e) => {
    const selectedCourseIndex = e.currentTarget.value;
    setCourse(courses[selectedCourseIndex]);
    setSubject("");
  }

  useEffect(() => {
    setError(course? "" : "You must select one course.");
  }, [course]);

  return {
    value: course,
    onChange: handleSelectOption,
    error
  }
}

const useSubjectSelector = (initSubject) => {
  const [subject, setSubject] = useState(initSubject);
  const [error, setError] = useState("");

  useEffect(() => {
    setError(subject ? "" : "You must select one subject.");
  }, [subject]);

  return {
    value: subject,
    onChange: setSubject,
    error,
  }
}

const useStartDateChooser = (initialStartDate) => {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [error, setError] = useState("");
  
  const handleChooseStartDate = date => {
    setStartDate(date);
  };

  useEffect(() => {
    setError(
      !isInArray(availableStartDates, startDate) ? 
      "Your selected course and subject is not offered beginning from your selected date.": 
      "");
  }, [startDate]);

  return {
    selected: startDate,
    onChange: handleChooseStartDate,
    error
  }
}

const useComposeAddtionalNotes = (initialNote) => {
  const [addNotes, setAddNotes] = useState(initialNote);
  const [error, setError] = useState("");

  const handleChangeAddtionalNotes = event => {
    setAddNotes(event.target.value);
  };

  useEffect(() => {
    addNotes.length && setError(
      addNotes.length < 20 ? 
      "You must write addition notes more than 20 characters." : 
      addNotes.length >= 500 ? 
      "You must write addition notes less than 500 characters." : 
      "");
  }, [addNotes]);
  
  return {
    value: addNotes,
    onChange: handleChangeAddtionalNotes,
    error
  }
}

const useModal = (initState) => {
  const [modal, setModal] = useState(initState);

  const handleCloseModal = () => {
    setModal(false);
  };

  return {
    isOpen: modal,
    onRequestClose: handleCloseModal,
    setModal
  }
};

const App = () => {
  // subject
  const subject = useSubjectSelector("");

  // course option
  const courseOption = useCourseOption(courses[0], subject.onChange);

  // course start date chooser
  const startDate = useStartDateChooser(new Date());

  // additional notes
  const addNotes = useComposeAddtionalNotes("");

  // modal for success message
  const successModal = useModal(false);

  // UI loading
  const [loading, setLoading] = useState(false);
  
  // regiter handler
  const handleSubmit = e => {
    e.preventDefault(); // prevent reload page after submit form data

    if (subject.error || courseOption.error || startDate.error || addNotes.error) {
      alert("Please fill out correct data.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      successModal.setModal(true);
    }, 3000);
  };

  return (
    <Panel>
      <Loading>
        <DotLoader loading={loading}/>
      </Loading>
      <form onSubmit={handleSubmit}>
        <Courses>
          {courses.map((course) => (
            <label key={course.id}>
              <Input type="radio" onChange={courseOption.onChange} value={course.id} checked={course.id === courseOption.value.id} />
              {course.title}
            </label>
          ))}
          {courseOption.error&&<div className="error">{courseOption.error}</div>}
        </Courses>

        <MarginComponent>
          <label>Subject:</label>
          <Select
            {...subject}
            options={courseOption.value.subjects} />
          {subject.error&&<div className="error">{subject.error}</div>}
        </MarginComponent>

        <MarginComponent>
          <label>Start Date:</label>
          <br/>
          <DatePicker {...startDate}/>
          {startDate.error&&<div className="error">{startDate.error}</div>}
        </MarginComponent>

        <MarginComponent>
          <label>Additional Notes:</label>
          <textarea
            {...addNotes}
            maxLength="500"
            rows="10"
            cols="50" />
            {addNotes.error&&<div className="error">{addNotes.error}</div>}
        </MarginComponent>

        <Input
          type="submit"
          value="Submit" />
      </form>

      <Modal
        {...successModal}
        style={customStyles}
        contentLabel="Create a Post"
      >
        <div>Your course has been successfully registered.</div>
        <button disabled={loading} onClick={successModal.onRequestClose}>Ok</button>
      </Modal>
    </Panel>
  );
}

const Panel = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  margin: 20px;
`;

const Input = styled.input`
  border-radius: 4px;
  position: relative;
  background-color: transparent;
  border: 1px solid #ced4da;
  fontSize: 16px;
  padding: 10px 20px;
  & :focus: {
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, .25);
  }
`;

const Courses = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
`;

const MarginComponent = styled.div`
  margin-bottom: 20px;
`;

const Loading = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
`;

export default App;
