import { Box, Grid, Skeleton, Card, CardContent } from '@mui/material';

export function KpiCardSkeleton() {
  return (
    <Card sx={{ borderTop: '3px solid', borderTopColor: 'divider' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={14} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={40} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="70%" height={12} />
          </Box>
          <Skeleton variant="circular" width={36} height={36} />
        </Box>
      </CardContent>
    </Card>
  );
}

export function TableRowSkeleton({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <Box
          key={i}
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 2,
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} variant="text" height={18} width={`${60 + Math.random() * 30}%`} />
          ))}
        </Box>
      ))}
    </>
  );
}

export function AnalysisSectionSkeleton() {
  return (
    <Box>
      {/* Top summary strip */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Skeleton variant="circular" width={20} height={20} />
                <Box>
                  <Skeleton variant="text" width={60} height={12} />
                  <Skeleton variant="text" width={100} height={16} />
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Gauge placeholder */}
        <Grid item xs={12} sm={5} md={3}>
          <Card sx={{ height: 180 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3 }}>
              <Skeleton variant="circular" width={110} height={110} />
              <Skeleton variant="text" width={80} height={16} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>

        {/* Severity bars */}
        <Grid item xs={12} sm={7} md={4}>
          <Card sx={{ height: 180 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Skeleton variant="text" width={120} height={14} sx={{ mb: 1.5 }} />
              {Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Skeleton variant="text" width={60} height={14} />
                    <Skeleton variant="text" width={24} height={14} />
                  </Box>
                  <Skeleton variant="rectangular" height={6} width="100%" />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Category bars */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: 180 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Skeleton variant="text" width={140} height={14} sx={{ mb: 1.5 }} />
              {Array.from({ length: 5 }).map((_, i) => (
                <Box key={i} sx={{ mb: 1.2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                    <Skeleton variant="text" width={`${50 + i * 10}%`} height={13} />
                    <Skeleton variant="text" width={24} height={13} />
                  </Box>
                  <Skeleton variant="rectangular" height={6} width="100%" />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tab body skeleton */}
      <Card>
        <Box sx={{ px: 2, pt: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 3 }}>
          {['Executive Summary', 'Clause Deviations', 'Recommendations'].map((t) => (
            <Skeleton key={t} variant="text" width={120} height={36} />
          ))}
        </Box>
        <CardContent sx={{ p: 3 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="text" width={`${70 + (i % 3) * 10}%`} height={18} sx={{ mb: 1 }} />
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}

export function HomeSkeleton() {
  return (
    <Box>
      {/* Hero skeleton */}
      <Skeleton variant="rectangular" height={200} sx={{ mb: 4, borderRadius: 0 }} />

      {/* KPI cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <KpiCardSkeleton />
          </Grid>
        ))}
      </Grid>

      {/* Table + workflow */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5 }}>
                <Skeleton variant="text" width={160} height={24} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width={280} height={14} sx={{ mb: 2 }} />
              </Box>
              <TableRowSkeleton rows={5} cols={5} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Skeleton variant="text" width={120} height={22} sx={{ mb: 2 }} />
              {Array.from({ length: 5 }).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Skeleton variant="circular" width={32} height={32} sx={{ flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={16} />
                    <Skeleton variant="text" width="80%" height={13} />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
