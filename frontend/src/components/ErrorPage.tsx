import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Stack
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface ErrorPageProps {
  status: 401 | 403 | 404 | 500;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ status }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const getErrorInfo = () => {
    switch (status) {
      case 401:
        return {
          title: 'Необходима авторизация',
          description: 'Для доступа к этой странице необходимо войти в систему.',
          primaryAction: {
            text: 'Войти',
            handler: () => navigate('/login')
          }
        };
      case 403:
        return {
          title: 'Доступ запрещен',
          description: 'У вас нет прав для доступа к этой странице.',
          primaryAction: {
            text: 'На главную',
            handler: () => navigate('/')
          }
        };
      case 404:
        return {
          title: 'Страница не найдена',
          description: 'Запрашиваемая страница не существует.',
          primaryAction: {
            text: 'На главную',
            handler: () => navigate('/')
          }
        };
      case 500:
        return {
          title: 'Ошибка сервера',
          description: 'Произошла внутренняя ошибка сервера. Попробуйте позже.',
          primaryAction: {
            text: 'Обновить страницу',
            handler: () => window.location.reload()
          }
        };
      default:
        return {
          title: 'Произошла ошибка',
          description: 'Что-то пошло не так.',
          primaryAction: {
            text: 'На главную',
            handler: () => navigate('/')
          }
        };
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            textAlign: 'center'
          }}
        >
          <ErrorOutlineIcon
            color="error"
            sx={{ fontSize: 64, mb: 2 }}
          />
          
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            color="error"
          >
            {status}
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
          >
            {errorInfo.title}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
          >
            {errorInfo.description}
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            mt={3}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Назад
            </Button>
            
            <Button
              variant="contained"
              onClick={errorInfo.primaryAction.handler}
              color="primary"
            >
              {errorInfo.primaryAction.text}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default ErrorPage; 