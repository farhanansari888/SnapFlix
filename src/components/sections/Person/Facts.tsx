import DetailFacts from "@/components/sections/Detail/DetailFacts";
import { formatDate } from "@/utils/helpers";

interface PersonFactsProps {
  person: {
    biography?: string;
    birthday?: string | null;
    deathday?: string | null;
    place_of_birth?: string | null;
    known_for_department?: string;
    also_known_as?: string[];
    gender?: number;
  };
}

const GENDER_LABEL: Record<number, string> = {
  1: "Female",
  2: "Male",
  3: "Non-binary",
};

const PersonFacts: React.FC<PersonFactsProps> = ({ person }) => {
  return (
    <DetailFacts
      overview={person.biography || undefined}
      facts={[
        ["Known For", person.known_for_department],
        ["Gender", person.gender ? GENDER_LABEL[person.gender] : undefined],
        ["Birthday", person.birthday ? formatDate(person.birthday, "en-US") : undefined],
        ["Died", person.deathday ? formatDate(person.deathday, "en-US") : undefined],
        ["Place of Birth", person.place_of_birth],
        [
          "Also Known As",
          person.also_known_as && person.also_known_as.length > 0
            ? person.also_known_as.slice(0, 3).join(", ")
            : undefined,
        ],
      ]}
    />
  );
};

export default PersonFacts;
