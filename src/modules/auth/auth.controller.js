const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const result = await authService.register(username, email, password);

  new ApiResponse(201, result, 'User registered successfully').send(res);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  new ApiResponse(200, result, 'Login successful').send(res);
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refresh(refreshToken);

  new ApiResponse(200, result, 'Token refreshed successfully').send(res);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);

  new ApiResponse(200, null, 'Logged out successfully').send(res);
});

const me = asyncHandler(async (req, res) => {
  const user = await require('./auth.repository').findUserById(req.user.id);

  new ApiResponse(200, user, 'User fetched successfully').send(res);
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
};
