import React, { useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Problem, ProblemCreate, ProblemUpdate } from '../../types/problem';
import { useCreateProblemMutation, useUpdateProblemMutation } from '../../store/apis/problemsApi';
import LaTeXEditor from '../math/LaTeXEditor';

// TODO: Define available topics (potentially fetch from backend later)
const availableTopics = ['Algebra', 'Calculus', 'Geometry', 'Number Theory', 'Combinatorics', 'Logic'];

interface ProblemFormDialogProps {
  open: boolean;
  onClose: () => void;
  problem: Problem | null; // null for create mode, problem object for edit mode
}

// Validation Schema
const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  statement: Yup.string().required('Statement is required'),
  difficulty: Yup.number()
    .required('Difficulty is required')
    .min(1, 'Difficulty must be between 1 and 9')
    .max(9, 'Difficulty must be between 1 and 9')
    .integer('Difficulty must be an integer'),
  topics: Yup.array().of(Yup.string()),
  is_published: Yup.boolean(),
});

type FormValues = Omit<ProblemCreate, 'topics'> & { topics: string[] };

const ProblemFormDialog: React.FC<ProblemFormDialogProps> = ({ open, onClose, problem }) => {
  const [createProblem, { isLoading: isCreating, error: createError }] = useCreateProblemMutation();
  const [updateProblem, { isLoading: isUpdating, error: updateError }] = useUpdateProblemMutation();

  const initialValues: FormValues = {
    title: problem?.title || '',
    statement: problem?.statement || '',
    difficulty: problem?.difficulty || 1,
    topics: problem?.topics || [],
    is_published: problem?.is_published || false,
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    setSubmitting(true);
    try {
      if (problem) {
        // Update existing problem
        const updateData: ProblemUpdate = { ...values };
        await updateProblem({ id: problem.id, data: updateData }).unwrap();
      } else {
        // Create new problem
        const createData: ProblemCreate = { ...values };
        await createProblem(createData).unwrap();
      }
      onClose(); // Close dialog on success
    } catch (err) {
      console.error('Failed to save problem:', err);
      // Error is handled by the error state variables below
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{problem ? 'Edit Problem' : 'Create New Problem'}</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize // Reinitialize form when `problem` prop changes
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
          <Form>
            <DialogContent>
              {error && (
                 <Alert severity="error" sx={{ mb: 2 }}>
                    Failed to save problem: {JSON.stringify(error)}
                 </Alert>
               )}
              <TextField
                autoFocus
                margin="dense"
                id="title"
                name="title"
                label="Title"
                type="text"
                fullWidth
                variant="outlined"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.title && Boolean(errors.title)}
                helperText={touched.title && errors.title}
                disabled={isLoading}
              />
              
              {/* Replace TextField with LaTeX Editor */}
              <Box sx={{ my: 2 }}>
                <LaTeXEditor
                  label="Problem Statement (Markdown/LaTeX supported)"
                  value={values.statement}
                  onChange={(newValue) => setFieldValue('statement', newValue)}
                  error={touched.statement && Boolean(errors.statement)}
                  helperText={touched.statement ? errors.statement : undefined}
                  disabled={isLoading}
                  rows={10}
                />
              </Box>
              
              <TextField
                margin="dense"
                id="difficulty"
                name="difficulty"
                label="Difficulty (1-9)"
                type="number"
                fullWidth
                variant="outlined"
                value={values.difficulty}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.difficulty && Boolean(errors.difficulty)}
                helperText={touched.difficulty && errors.difficulty}
                disabled={isLoading}
                InputProps={{ inputProps: { min: 1, max: 9 } }}
              />
              <FormControl fullWidth margin="dense" disabled={isLoading}>
                <InputLabel id="topics-label">Topics</InputLabel>
                <Select
                    labelId="topics-label"
                    id="topics"
                    name="topics"
                    multiple
                    value={values.topics}
                    onChange={(event: SelectChangeEvent<string[]>) => {
                        const { target: { value } } = event;
                        setFieldValue(
                            'topics',
                            // On autofill we get a stringified value.
                            typeof value === 'string' ? value.split(',') : value,
                        );
                    }}
                    input={<OutlinedInput label="Topics" />}
                    renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                        ))}
                    </Box>
                    )}
                >
                    {availableTopics.map((topic) => (
                    <MenuItem key={topic} value={topic}>
                        {topic}
                    </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    id="is_published"
                    name="is_published"
                    checked={values.is_published}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                }
                label="Published"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting || isLoading}>
                {isLoading ? <CircularProgress size={24} /> : (problem ? 'Save Changes' : 'Create Problem')}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default ProblemFormDialog; 