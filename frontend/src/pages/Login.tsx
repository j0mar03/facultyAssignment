import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/redux';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { login } from '../services/api';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onSubmit = async (data: LoginFormData) => {
    try {
      dispatch(loginStart());
      const response = await login(data.email, data.password);
      dispatch(loginSuccess({
        user: response.user,
        token: response.token,
      }));
      navigate('/');
    } catch (err: any) {
      dispatch(loginFailure());
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%' }}>
          <CardContent>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              Faculty Load Management
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary" gutterBottom>
              Polytechnic University of the Philippines
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                margin="normal"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              
              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;