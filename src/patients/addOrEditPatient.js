import React, {useEffect, useState} from 'react';
import Input from "../components/input.component";
import Radio from "../components/radio.component";
import {useHistory, useParams} from "react-router-dom";
import patientService from "../services/patients.service";
import * as _ from "lodash";

export default function AddOrEditPatient() {
    const history = useHistory();
    const [patient, setPatient] = useState({});
    const { pesel } = useParams();

    async function loadPatient(pesel) {
        setPatient(await patientService.load(pesel));
    }

    useEffect(() => {
        if (pesel) {
            loadPatient(pesel);
        }
    }, [pesel]);

    function validatePesel(pesel) {
        if (!/^[0-9]{11}$/.test(pesel)) {
            return false;
        }
        const times = [1, 3, 7, 9];
        const digits = `${pesel}`.split('').map((digit) => parseInt(digit, 10));
        const dig11 = digits.splice(-1)[0];
        let control = digits.reduce((previousValue, currentValue, index) => previousValue + currentValue * times[index % 4]) % 10;

        return 10 - (control === 0 ? 10 : control) === dig11;
    }

    function verify(patient) {
        const errors = [
            patient.name ? null : "Imię jest wymagane!",
            patient.surname ? null : "Nazwisko jest wymagane!",
            patient.pesel ? null : "PESEL jest wymagany!",
            !patient.pesel || validatePesel(patient.pesel) ? null : "Niepoprawny format numeru PESEL.",
            patient.gender ? null : "Płeć jest wymagana!"
        ].filter($ => !!$)
            .join("\n");
        if (errors) {
            alert(errors);
            return false;
        }
        return true;
    }

    async function save() {
        if (!verify(patient)) {
            return;
        }
        await patientService.upsert(patient.pesel, patient);
        history.goBack();
    }

    return (
        <div>
            <h2 className="text-center">{pesel ? "Edycja" : "Dodawanie"} pacjenta</h2>
            <div className="container" style={{maxWidth: "500px"}}>
                <Input label="Imię" value={patient.name} onChange={v => patient.name = v} type="text" customLabelWidth="110px" />
                <Input label="Nazwisko" value={patient.surname} onChange={v => patient.surname = v} type="text" customLabelWidth="110px" />
                <Input label="PESEL" disabled={!!pesel} value={patient.pesel} onChange={v => patient.pesel = v} type="text" customLabelWidth="110px" />
                <Radio label="Płeć" name="gender" selected={patient.gender} onChange={v => patient.gender = v} customLabelWidth="110px" values={["Kobieta", "Mężczyzna"]} />
                <Input label="Adres email" value={patient.email} onChange={v => patient.email = v} type="text" customLabelWidth="110px" />
            </div>
            <div className="text-center" style={{marginTop: "50px"}}>
                <button className="btn btn-light" style={{marginRight: "20px"}} onClick={() => history.goBack()}>Anuluj</button>
                {/*{managedDepartment.id ? <button className="btn btn-danger" style={{marginRight: "20px"}} onClick={() => removeDepartment(managedDepartment)}>Usuń</button> : ''}*/}
                <button className="btn btn-primary" onClick={() => save()}>Zapisz</button>
            </div>
        </div>
    )
}