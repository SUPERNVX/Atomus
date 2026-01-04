export interface ModelInfo {
  title: string;
  description: string;
  experiment: string;
  limitations: string;
}

export const MODEL_DATA: Record<string, ModelInfo> = {
  dalton: {
    title: "dalton_title",
    description: "dalton_description",
    experiment: "dalton_experiment",
    limitations: "dalton_limitations"
  },
  thomson: {
    title: "thomson_title",
    description: "thomson_description",
    experiment: "thomson_experiment",
    limitations: "thomson_limitations"
  },
  rutherford: {
    title: "rutherford_title",
    description: "rutherford_description",
    experiment: "rutherford_experiment",
    limitations: "rutherford_limitations"
  },
  bohr: {
    title: "bohr_title",
    description: "bohr_description",
    experiment: "bohr_experiment",
    limitations: "bohr_limitations"
  },
  sommerfeld: {
    title: "sommerfeld_title",
    description: "sommerfeld_description",
    experiment: "sommerfeld_experiment",
    limitations: "sommerfeld_limitations"
  },
  schrodinger: {
    title: "schrodinger_title",
    description: "schrodinger_description",
    experiment: "schrodinger_experiment",
    limitations: "schrodinger_limitations"
  },
  entanglement: {
    title: "entanglement_title",
    description: "entanglement_description",
    experiment: "entanglement_experiment",
    limitations: "entanglement_limitations"
  }
};