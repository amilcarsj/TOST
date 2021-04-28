import numpy as np

def hampel_filter_pandas(input_series, window_size, n_sigmas=3):
  '''
  Returns list of indices of found outliers
  https://towardsdatascience.com/outlier-detection-with-hampel-filter-85ddf523c73d
  https://stackoverflow.com/questions/46819260/filtering-outliers-how-to-make-median-based-hampel-function-faster
  There is a bug using argwhere with this version of pandas: https://github.com/numpy/numpy/issues/15555
  Solution: https://github.com/enzoampil/fastquant/issues/85
  '''
  k = 1.4826 # scale factor for Gaussian distribution

  # helper lambda function
  MAD = lambda x: np.median(np.abs(x - np.median(x)))

  rolling_median = input_series.rolling(window=window_size, center=True).median()
  rolling_mad = k * input_series.rolling(window=window_size, center=True).apply(MAD)
  diff = np.abs(input_series - rolling_median)

  outliers_index = list(np.flatnonzero(diff > (n_sigmas * rolling_mad)))

  return outliers_index


